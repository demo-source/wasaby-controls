define(['Controls/_tile/TileView/TileViewModel', 'Types/collection', 'Types/entity'], function(TileViewModel, collection, entity) {
   'use strict';

   describe('Controls/_tile/TileView/TileViewModel', function() {
      const urlResolver = () => '';
      var
         tileViewModel = new TileViewModel({
            tileMode: 'static',
            itemsHeight: 300,
            tileWidth: 150,
            imageProperty: 'image',
            keyProperty: 'id',
            imageWidthProperty: 'imageWidth',
            imageHeightProperty: 'imageHeight',
            multiSelectPosition: 'default',
            imageFit: 'cover',
            imageUrlResolver: urlResolver,
            items: new collection.RecordSet({
               rawData: [{
                  'id': 1
               }, {
                  'id': 2
               }],
               keyProperty: 'id'
            }),
            theme: 'default',
            displayProperty: 'title'
         });

      it('constructor', function() {
         assert.equal(tileViewModel.getTileMode(), 'static');
         assert.equal(tileViewModel.getItemsHeight(), 300);
      });

      it('getCurrent', function() {
         var cur = tileViewModel.getCurrent();
         assert.equal(cur.tileMode, 'static');
         assert.equal(cur.itemsHeight, 300);
         assert.equal(cur.imageProperty, 'image');
      });

      it('setTileMode', function() {
         tileViewModel.setTileMode('dynamic');
         assert.equal(tileViewModel.getTileMode(), 'dynamic');
      });

      it('setItemsHeight', function() {
         tileViewModel.setItemsHeight(200);
         assert.equal(tileViewModel.getItemsHeight(), 200);
      });

      it('setHoveredItem', function() {
         tileViewModel.setHoveredItem({key: 1});
         assert.equal(tileViewModel.getHoveredItem().key, 1);
      });

      it('setActiveItem', function() {
         tileViewModel.setHoveredItem({key: 1});
         tileViewModel.setActiveItem(null);
         assert.equal(tileViewModel.getHoveredItem(), null);
         tileViewModel.setHoveredItem({key: 2});
         tileViewModel.setActiveItem({key: 3, setActive: function() {return null;}});
         assert.equal(tileViewModel.getHoveredItem().key, 2);
      });

      it('_onCollectionChange', function() {
         tileViewModel.setHoveredItem({key: 1});
         tileViewModel._onCollectionChange();
         assert.equal(tileViewModel.getHoveredItem(), null);
      });

      it('getTileItemData', function() {
         var tileItemData = tileViewModel.getTileItemData();
         assert.deepEqual(tileItemData, {
            tileMode: 'dynamic',
            itemsHeight: 200,
            imageProperty: 'image',
            defaultItemWidth: 250,
            defaultShadowVisibility: 'visible',
            itemClasses: 'controls-TileView__item_spacingLeft_default_theme-default controls-TileView__item_spacingRight_default_theme-default controls-TileView__item_spacingTop_default_theme-default controls-TileView__item_spacingBottom_default_theme-default',
            itemContentClasses: 'controls-TileView__item_roundBorder_topLeft_default_theme-default controls-TileView__item_roundBorder_topRight_default_theme-default controls-TileView__item_roundBorder_bottomLeft_default_theme-default controls-TileView__item_roundBorder_bottomRight_default_theme-default',
            itemCompressionCoefficient: 0.7,
            displayProperty: 'title',
            imageWidthProperty: 'imageWidth',
            imageHeightProperty: 'imageHeight',
            getImageProportion: tileViewModel.getImageProportion,
            itemWidth: 150,
            imageFit: 'cover',
            imageUrlResolver: urlResolver,
         });
      });

      it('getMultiSelectClassList hidden', function() {
         tileViewModel.setMultiSelectVisibility('hidden');
         var item = tileViewModel.getItemDataByItem(tileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, '');
      });


      it('getMultiSelectClassList visible', function() {
         tileViewModel.setMultiSelectVisibility('visible');
         var item = tileViewModel.getItemDataByItem(tileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable js-controls-ColumnScroll__notDraggable controls-CheckboxMarker_inList_theme-default controls-TileView__checkbox_position-default_theme-default controls-TileView__checkbox controls-TileView__checkbox_top js-controls-TileView__withoutZoom');
      });


      it('getMultiSelectClassList onhover unselected', function() {
         tileViewModel.setMultiSelectVisibility('onhover');
         var item = tileViewModel.getItemDataByItem(tileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable js-controls-ColumnScroll__notDraggable controls-CheckboxMarker_inList_theme-default controls-ListView__checkbox-onhover controls-TileView__checkbox_position-default_theme-default controls-TileView__checkbox controls-TileView__checkbox_top js-controls-TileView__withoutZoom');
      });

      it('getMultiSelectClassList onhover selected', function() {
         tileViewModel.setMultiSelectVisibility('onhover');
         tileViewModel.getItemBySourceKey(2).setSelected(true);
         var item = tileViewModel.getItemDataByItem(tileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable js-controls-ColumnScroll__notDraggable controls-CheckboxMarker_inList_theme-default controls-TileView__checkbox_position-default_theme-default controls-TileView__checkbox controls-TileView__checkbox_top js-controls-TileView__withoutZoom');
      });

      it('getItemsPaddingContainerClasses', () => {
         assert.equal(tileViewModel.getItemsPaddingContainerClasses(), 'controls-TileView__itemsPaddingContainer_spacingLeft_default_theme-default controls-TileView__itemsPaddingContainer_spacingRight_default_theme-default controls-TileView__itemsPaddingContainer_spacingTop_default_theme-default controls-TileView__itemsPaddingContainer_spacingBottom_default_theme-default');
         tileViewModel.setItemPadding({left: 's', right: 'null'});
         assert.equal(tileViewModel.getItemsPaddingContainerClasses(), 'controls-TileView__itemsPaddingContainer_spacingLeft_s_theme-default controls-TileView__itemsPaddingContainer_spacingRight_null_theme-default controls-TileView__itemsPaddingContainer_spacingTop_default_theme-default controls-TileView__itemsPaddingContainer_spacingBottom_default_theme-default');
      });

      it('getItemsPaddingContainer with itemPaddingsContainerOptions', () => {
         const tileViewModel2 = new TileViewModel({
            tileMode: 'static',
            itemsHeight: 300,
            tileWidth: 150,
            imageProperty: 'image',
            keyProperty: 'id',
            imageWidthProperty: 'imageWidth',
            itemsContainerPadding: {
               left: 's',
               right: 'null',
            },
            imageHeightProperty: 'imageHeight',
            multiSelectPosition: 'default',
            imageFit: 'cover',
            imageUrlResolver: urlResolver,
            items: new collection.RecordSet({
               rawData: [{
                  'id': 1
               }, {
                  'id': 2
               }],
               keyProperty: 'id'
            }),
            theme: 'default',
            displayProperty: 'title'
         });
         assert.equal(tileViewModel2.getItemsPaddingContainerClasses(), 'controls-TileView__itemsPaddingContainer_spacingLeft_s_itemPadding_default_theme-default controls-TileView__itemsPaddingContainer_spacingRight_null_itemPadding_default_theme-default controls-TileView__itemsPaddingContainer_spacingTop_default_itemPadding_default_theme-default controls-TileView__itemsPaddingContainer_spacingBottom_default_itemPadding_default_theme-default');
      });

      describe('getTileWidth', () => {
         it('image width proportion <= 0.5', () => {
            const tileItem = new entity.Model({
               rawData: {
                  id: '1',
                  imageWidth: 100,
                  imageHeight: 200,
               }
            });
            let width = tileViewModel.getTileWidth(tileItem, 'imageHeight', 'imageWidth', 'dynamic', 200, null);
            assert.strictEqual(width, 300);
         });
         it('image width proportion > 1.5', () => {
            const tileItem = new entity.Model({
               rawData: {
                  id: '1',
                  imageWidth: 300,
                  imageHeight: 100,
               }
            });
            let width = tileViewModel.getTileWidth(tileItem, 'imageHeight', 'imageWidth', 'dynamic', 200, null);
            assert.strictEqual(width, 150);
         });

         it('returns custom minimal item width', () => {
            const tileItem = new entity.Model({
               rawData: {
                  id: '1',
                  imageWidth: 300,
                  imageHeight: 100,
               }
            });
            let width = tileViewModel.getTileWidth(tileItem, 'imageHeight', 'imageWidth', 'dynamic', 200, 400);
            assert.strictEqual(width, 150);
         });
      });
   });
});
