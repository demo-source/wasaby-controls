/**
 * Created by iv.cheremushkin on 13.08.2014.
 */

define('js!SBIS3.CONTROLS.ButtonGroupBaseDS', ['js!SBIS3.CORE.CompoundControl', 'js!SBIS3.CONTROLS.DSMixin',   'js!SBIS3.CONTROLS.DataBindMixin'], function(CompoundControl, DSMixin, DataBindMixin) {

   'use strict';

   /**
    * Контрол, реализующий поведение выбора одного из нескольких значений при помощи набора радиокнопок. Отображения не имеет.
    * @class SBIS3.CONTROLS.ButtonGroupBase
    * @mixes SBIS3.CONTROLS.CollectionMixin
    * @mixes SBIS3.CONTROLS.Selectable
    * @extends $ws.proto.CompoundControl
    */

   var ButtonGroupBase = CompoundControl.extend([DSMixin, DataBindMixin], /** @lends SBIS3.CONTROLS.ButtonGroupBase.prototype */ {
      $protected: {
         _options: {
            captionField : ''
         }
      },

      $constructor: function() {
         this._container.removeClass('ws-area');
      },

      init : function() {
         ButtonGroupBase.superclass.init.call(this);
         this.reload();
      },

      setEnabled: function(enabled) {
        ButtonGroupBase.superclass.setEnabled.call(this, enabled);
        var itemsInstances = this.getItemsInstances();
        for (var i in itemsInstances){
          itemsInstances[i].setEnabled(enabled);
        }
      },

      _drawItemsCallback : function(){
         var
            controls = this.getItemsInstances(),
            self = this;
         for (var i in controls) {
            if (controls.hasOwnProperty(i)) {
               controls[i].subscribe('onActivated', function () {
                  var id = this.getContainer().data('id');
                  self._itemActivatedHandler(id);
               })
            }
         }
      },

      _itemActivatedHandler : function() {
         /*метод должен быть перегружен*/
      }
   });

   return ButtonGroupBase;

});