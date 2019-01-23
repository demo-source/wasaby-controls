define('Controls/Date/MonthList/ListControl', [
   'Types/chain',
   'Types/source',
   'Controls/List/ListControl',
   'wml!Controls/Date/MonthList/ListControl',
   'wml!Controls/List/ListControl/ListControl'
], function(
   chain,
   sourceLib,
   ListControl,
   tmpl,
   baseControlTmpl
) {
   'use strict';

   /**
    * Plain list control with custom item template. Can load data from data source and and can enrich data from .
    *
    * @class Controls/Date/MonthList/ListControl
    * @extends Controls/List
    * @control
    * @author Миронов А.Ю.
    */

   var _private = {
      getQuery: function(items) {
         var length = chain.factory(items).toArray().length,
            startId = items.at(0).getId(),
            endId = items.at(length - 1).getId(),
            query = new sourceLib.Query();

         return query.where({ 'id>=': (startId < endId ? startId : endId) - 1 }).limit(length);
      },

      dataLoadCallback: function(self, items) {
         if (self._options.sourceExt) {
            self._options.sourceExt.query(_private.getQuery(items)).addCallback(function(richItems) {
               this._children.baseControl.getViewModel().mergeItems(richItems.getAll(), { inject: true });
            }.bind(self));
         }
      }
   };

   var ModuleControl = ListControl.extend(/** @lends Controls/Date/MonthList/List.prototype */{
      _template: tmpl,
      _baseControlTmpl: baseControlTmpl,

      _beforeMount: function() {
         this._dataLoadCallback = _private.dataLoadCallback.bind(null, this);
         ModuleControl.superclass._beforeMount.apply(this, arguments);
      }
   });

   ModuleControl._private = _private;

   return ModuleControl;
});
