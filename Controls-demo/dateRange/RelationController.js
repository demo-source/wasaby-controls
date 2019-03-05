define('Controls-demo/dateRange/RelationController', [
   'Core/Control',
   'Types/collection',
   'wml!Controls-demo/dateRange/RelationController',
   'css!Controls-demo/dateRange/RelationController'
], function(
   BaseControl,
   collection,
   template
) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,

      _startValue0: new Date(2017, 0, 1),
      _endValue0: new Date(2017, 1, 0),
      _startValue1: new Date(2017, 1, 1),
      _endValue1: new Date(2017, 2, 0),
      _startValue2: new Date(2017, 2, 1),
      _endValue2: new Date(2017, 3, 0),

      _bindType: 'normal',

      _startValue2_0: new Date(2017, 0, 1),
      _endValue2_0: new Date(2017, 1, 0),
      _startValue2_1: new Date(2017, 1, 1),
      _endValue2_1: new Date(2017, 2, 0),
      _startValue2_2: new Date(2017, 2, 1),
      _endValue2_2: new Date(2017, 3, 0),

      _bindType2: 'normal',

      _beforeMount: function() {
      },

      _onRelationButtonClick: function() {
         if (this._bindType === 'normal') {
            this._bindType = 'byCapacity';
         } else {
            this._bindType = 'normal';
         }
      },

      _onRelationButtonClick2: function() {
         if (this._bindType2 === 'normal') {
            this._bindType2 = 'byCapacity';
         } else {
            this._bindType2 = 'normal';
         }
      }

   });
   return ModuleClass;
});
