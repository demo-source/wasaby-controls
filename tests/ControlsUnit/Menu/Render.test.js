define(
   [
      'Controls/menu',
      'Types/source',
      'Core/core-clone',
      'Controls/display',
      'Types/collection',
      'Types/entity'
   ],
   function(menu, source, Clone, display, collection, entity) {
      describe('Menu:Render', function() {
         let defaultItems = [
            { key: 0, title: 'все страны' },
            { key: 1, title: 'Россия' },
            { key: 2, title: 'США' },
            { key: 3, title: 'Великобритания' }
         ];

         let getListModel = function(items, nodeProperty) {
            return new display.Tree({
               collection: new collection.RecordSet({
                  rawData: Clone(items || defaultItems),
                  keyProperty: 'key'
               }),
               keyProperty: 'key',
               nodeProperty
            });
         };

         let getListModelWithSbisAdapter = function() {
            return new display.Tree({
               collection: new collection.RecordSet({
                  rawData: {
                     _type: 'recordset',
                     d: [],
                     s: [
                        { n: 'id', t: 'Строка' },
                        { n: 'title', t: 'Строка' },
                     ]
                  },
                  keyProperty: 'id',
                  adapter: new entity.adapter.Sbis()
               })
            });
         };

         let defaultOptions = {
            listModel: getListModel()
         };

         let getRender = function(config) {
            let menuControl = new menu.Render();
            menuControl.saveOptions(config || defaultOptions);
            return menuControl;
         };

         it('_proxyEvent', function() {
            let menuRender = getRender();
            let actualData;
            let isStopped = false;
            menuRender._notify = (e, d) => {
               if (e === 'itemClick') {
                  actualData = d;
               }
            };
            const event = {
               type: 'click',
               stopPropagation: () => {isStopped = true;}
            };
            menuRender._proxyEvent(event, 'itemClick', { key: 1 }, 'item1');
            assert.deepEqual(actualData[0], { key: 1 });
            assert.deepEqual(actualData[1], 'item1');
            assert.isTrue(isStopped);
         });

         it('getLeftSpacing', function() {
            let menuRender = getRender();
            let renderOptions = {
               listModel: getListModel(),
               itemPadding: {}
            };
            let leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'l');

            renderOptions.multiSelect = true;
            leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'null');

            renderOptions.itemPadding.left = 'xs';
            leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'xs');
         });

         it('getRightSpacing', function() {
            let menuRender = getRender();
            let renderOptions = {
               listModel: getListModel(),
               itemPadding: {},
               nodeProperty: 'node'
            };
            let rightSpacing = menuRender.getRightSpacing(renderOptions);
            assert.equal(rightSpacing, 'l');

            let items = Clone(defaultItems);
            items[0].node = true;
            renderOptions.listModel = getListModel(items, 'node');
            rightSpacing = menuRender.getRightSpacing(renderOptions);
            assert.equal(rightSpacing, 'menu-expander');

            renderOptions.itemPadding.right = 'xs';
            rightSpacing = menuRender.getRightSpacing(renderOptions);
            assert.equal(rightSpacing, 'xs');
         });

         describe('addEmptyItem', function() {
            let menuRender, renderOptions;
            beforeEach(function() {
               menuRender = getRender();
               renderOptions = {
                  listModel: getListModelWithSbisAdapter(),
                  emptyText: 'Not selected',
                  emptyKey: null,
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKeys: []
               };
            });

            it('check items count', function() {
               menuRender.addEmptyItem(renderOptions.listModel, renderOptions);
               assert.equal(renderOptions.listModel.getCount(), 1);
               assert.equal(renderOptions.listModel.getCollection().at(0).get('title'), 'Not selected');
               assert.equal(renderOptions.listModel.getCollection().at(0).get('id'), null);
            });

            it('check selected empty item', function() {
               renderOptions.selectedKeys = [null];
               menuRender.addEmptyItem(renderOptions.listModel, renderOptions);
               assert.isTrue(renderOptions.listModel.getItemBySourceKey(null).isSelected());
            });
         });

         describe('_isGroupVisible', function() {
            let getGroup = (item) => {
               if (!item.get('group')) {
                  return 'CONTROLS_HIDDEN_GROUP';
               }
               return item.get('group');
            };
            it('simple', function() {
               let groupListModel = getListModel([
                  { key: 0, title: 'все страны' },
                  { key: 1, title: 'Россия', icon: 'icon-add' },
                  { key: 2, title: 'США', group: '2' },
                  { key: 3, title: 'Великобритания', group: '2' },
                  { key: 4, title: 'Великобритания', group: '2' },
                  { key: 5, title: 'Великобритания', group: '3' }
               ]);
               groupListModel.setGroup(getGroup);

               let menuRender = getRender(
                  { listModel: groupListModel }
               );

               let result = menuRender._isGroupVisible(groupListModel.at(0));
               assert.isFalse(result);

               result = menuRender._isGroupVisible(groupListModel.at(3));
               assert.isTrue(result);
            });

            it('one group', function() {
               let groupListModel = getListModel([
                  { key: 0, title: 'все страны', group: '2' },
                  { key: 1, title: 'Россия', icon: 'icon-add', group: '2' },
                  { key: 2, title: 'США', group: '2' },
                  { key: 3, title: 'Великобритания', group: '2' },
                  { key: 4, title: 'Великобритания', group: '2' }
               ]);
               groupListModel.setGroup(getGroup);

               let menuRender = getRender(
                  { listModel: groupListModel }
               );

               let result = menuRender._isGroupVisible(groupListModel.at(0));
               assert.isFalse(result);
            });
         });

         it('getIconPadding', function() {
            let menuRender = getRender();
            let iconItems = [
               { key: 0, title: 'все страны' },
               { key: 1, title: 'Россия', icon: 'icon-add' },
               { key: 2, title: 'США' },
               { key: 3, title: 'Великобритания' }
            ];
            let renderOptions = {
               listModel: getListModel(iconItems),
               iconSize: 'm'
            };
            let iconPadding = menuRender.getIconPadding(renderOptions);
            assert.equal(iconPadding, 'm');

            iconItems = [
               { key: 0, title: 'все страны', node: true },
               { key: 1, title: 'Россия', icon: 'icon-add', parent: 0 },
               { key: 2, title: 'США' },
               { key: 3, title: 'Великобритания' }
            ];
            renderOptions.listModel = getListModel(iconItems);
            renderOptions.parentProperty = 'parent';
            renderOptions.nodeProperty = 'node';
            iconPadding = menuRender.getIconPadding(renderOptions);
            assert.equal(iconPadding, '');

            renderOptions.headingIcon = 'icon-Add';
            iconPadding = menuRender.getIconPadding(renderOptions);
            assert.equal(iconPadding, '');
         });

      });
   }
);
