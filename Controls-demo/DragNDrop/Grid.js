define('Controls-demo/DragNDrop/Grid', [
   'Core/Control',
   'Controls-demo/DragNDrop/DemoData',
   'Controls-demo/DragNDrop/ListEntity',
   'tmpl!Controls-demo/DragNDrop/Grid/Grid',
   'WS.Data/Source/Memory'
], function(BaseControl, DemoData, ListEntity, template, MemorySource) {

   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,

      _viewSource: new MemorySource({
         idProperty: 'id',
         data: DemoData
      }),

      _gridColumns: [{
         displayProperty: 'id'
      }, {
         displayProperty: 'title'
      }, {
         displayProperty: 'additional'
      }],

      _gridHeader: [{
         title: 'ID'
      }, {
         title: 'Title'
      }, {
         title: 'Additional'
      }],

      _dragStart: function(event, items) {
         var hasBadItems = false;
         items.forEach(function(item) {
            if (item.getId() === 0) {
               hasBadItems = true;
            }
         });
         return hasBadItems ? false : new ListEntity({
            items: items
         });
      }
   });

   return ModuleClass;
});
