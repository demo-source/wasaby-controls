define('Controls/List/ListControl', [
   'Core/Control',
   'tmpl!Controls/List/ListControl/ListControl',
   'Controls/List/BaseControl'
], function(Control,

   ListControlTpl
) {
   'use strict';

   var _private = {
   };

   /**
    * Plain list control with custom item template. Can load data from data source.
    *
    * @class Controls/List
    * @extends Controls/List/BaseControl
    * @mixes Controls/interface/ISource
    * @mixes Controls/interface/IMultiSelectable
    * @mixes Controls/interface/IGroupedView
    * @mixes Controls/interface/INavigation
    * @mixes Controls/interface/IFilter
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/interface/IReorderMovable
    * @mixes Controls/List/interface/IListControl
    * @mixes Controls/interface/IRemovable
    * @control
    * @public
    * @category List
    */

   var ListControl = Control.extend({
      _template: ListControlTpl,
      removeItems: function(items) {
         this._children.baseControl.removeItems(items);
      },
      moveItemUp: function(item) {
         this._children.baseControl.moveItemUp(item);
      },
      moveItemDown: function(item) {
         this._children.baseControl.moveItemDown(item);
      },
      moveItems: function(items, target, position) {
         this._children.baseControl.moveItems(items, target, position);
      },
      reload: function() {
         this._children.baseControl.reload();
      },
      editItem: function(options) {
         this._children.baseControl.editItem(options);
      },
      addItem: function(options) {
         this._children.baseControl.addItem(options);
      },
      _onCheckBoxClick: function(e, key, status) {
         var newSelectedKeys = this._options.selectedKeys.slice();
         if (status) {
            newSelectedKeys.splice(newSelectedKeys.indexOf(key), 1);
            this._notify('selectedKeysChanged', [newSelectedKeys, [], [key]]);
         } else {
            newSelectedKeys.push(key);
            this._notify('selectedKeysChanged', [newSelectedKeys, [key], []]);
         }
      },

      _onAfterItemsRemoveHandler: function(e, keys, result) {
         var newSelectedKeys = this._options.selectedKeys.slice();
         keys.forEach(function(key) {
            newSelectedKeys.splice(newSelectedKeys.indexOf(key), 1);
         });
         this._notify('afterItemsRemove', [keys, result]);
         this._notify('selectedKeysChanged', [newSelectedKeys, [], keys]);
      }
   });

   ListControl.getDefaultOptions = function() {
      return {
         uniqueKeys: true
      };
   };

   return ListControl;
});
