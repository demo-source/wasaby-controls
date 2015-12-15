/* global define, console, doT, $ws, $ */
define('js!SBIS3.CONTROLS.ComboBoxNewListView', [
   'js!SBIS3.CONTROLS.ListControl.View'
], function (ListView) {
   'use strict';

   /**
    * Представление для выпадающего списка комбобокса
    * @class SBIS3.CONTROLS.ComboBoxView
    * @extends SBIS3.CONTROLS.ListControl.View
    * @author Крайнов Дмитрий Олегович
    */
   return ListView.extend(/** @lends SBIS3.CONTROLS.ComboBoxView.prototype */{
      $protected: {
         _сssPrefix: 'controls-ComboBox__',
         _itemContainerTag: 'div',
         _itemContainerCssClass: 'itemRow',
         _itemContainerSelectedCssClass: 'itemRow__selected',
         _itemContainerHoverCssClass: 'itemRow__hovered',
         _itemsEmptyCssClass: 'itemRow',
         _pickerClass: 'controls-ComboBox__picker'

      },
      addPickerClass: function() {
         this.getRootNode().addClass(this._pickerClass);
      },
      setWidth: function(width) {
         this.getRootNode().css({
            'min-width':width
         });
      }
   });
});
