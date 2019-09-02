define(
   [
      'Controls/filterPopup',
      'Controls/_dropdownPopup/DropdownViewModel',
      'Types/collection'
   ],
   function(filterPopup, DropdownViewModel, collection) {
      describe('FilterSimplePanelList', function() {

         let defaultItems = new collection.RecordSet({
            idProperty: 'id',
            rawData: [{id: '1', title: 'Test1'},
               {id: '2', title: 'Test2'},
               {id: '3', title: 'Test3'},
               {id: '4', title: 'Test4'},
               {id: '5', title: 'Test5'},
               {id: '6', title: 'Test6'}]
         });

         let defaultConfig = {
            displayProperty: 'title',
            keyProperty: 'id',
            emptyText: '',
            resetValue: ['2'],
            id: 'text',
            items: defaultItems.clone(),
            selectedKeys: [],
            multiSelect: true
         };

         let getList = function (config) {
            let list = new filterPopup._List();
            list.saveOptions(config);
            return list;
         };

         it('_beforeMount', function() {
            let expectedListModel = new DropdownViewModel({
               items: defaultConfig.items,
               selectedKeys: defaultConfig.selectedKeys,
               keyProperty: defaultConfig.keyProperty,
               itemTemplateProperty: defaultConfig.itemTemplateProperty,
               displayProperty: defaultConfig.displayProperty,
               emptyText: defaultConfig.emptyText,
               emptyKey: defaultConfig.emptyKey
            });
            let list = getList(defaultConfig);
            list._beforeMount(defaultConfig);
            assert.deepStrictEqual(list._listModel._options, expectedListModel._options);
         });

         it('_beforeUpdate', function() {
            let list = getList(defaultConfig),
               items = new collection.RecordSet({
                  idProperty: 'id',
                  rawData: [{id: '1', title: 'Test1'}, {id: '2', title: 'Test2'}, {id: '3', title: 'Test3'}]});
            let newConfig = {...defaultConfig, items};
            list._beforeMount(defaultConfig);
            list._beforeUpdate(newConfig);
            assert.deepStrictEqual(items.getRawData(), list._listModel.getItems().getRawData());

            let selectedKeys = ['2'];
            newConfig = {...defaultConfig, selectedKeys};
            list._beforeUpdate(newConfig);
            assert.deepStrictEqual(selectedKeys, list._listModel.getSelectedKeys());
         });

         it('_itemClickHandler', function() {
            let list = getList(defaultConfig),
               itemClickResult, checkBoxClickResult;
            list._notify = (event, data) => {
               if (event === 'itemClick') {
                  itemClickResult = data[0];
               } else if (event === 'checkBoxClick') {
                  checkBoxClickResult = data[0];
               }
            };
            list._beforeMount(defaultConfig);

            let isCheckBoxClick = false;
            let event = {target: {closest: () => {return isCheckBoxClick;}}};

            // item click without selection
            list._itemClickHandler(event, defaultItems.at(0));
            assert.deepStrictEqual(itemClickResult, ['1']);

            // item click with selection
            let newConfig = {...defaultConfig, selectedKeys: ['1', '3']};
            list._beforeUpdate(newConfig);
            list._itemClickHandler(event, defaultItems.at(2));
            assert.deepStrictEqual(checkBoxClickResult, ['1']);

            //checkbox click
            isCheckBoxClick = true;
            list._itemClickHandler(event, defaultItems.at(4));
            assert.deepStrictEqual(checkBoxClickResult, ['1', '5']);

            //checkbox click
            isCheckBoxClick = true;
            list._itemClickHandler(event, defaultItems.at(1));
            assert.deepStrictEqual(itemClickResult, ['2']);
         });

         it('_afterOpenDialogCallback', function() {
            let list = getList(defaultConfig);
            list._beforeMount(defaultConfig);
            let isNotified;
            list._notify = (event) => {
               if (event === 'moreButtonClick') {
                  isNotified = true;
               }
            };
            list._afterOpenDialogCallback([1, 2, 3]);
            assert.isTrue(isNotified);
         });

      });
   }
);
