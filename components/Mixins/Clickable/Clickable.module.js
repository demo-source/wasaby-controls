define('js!SBIS3.CONTROLS.Clickable', [], function() {

   if (typeof window !== 'undefined') {
      $(document).mouseup(function () {
         $('.controls-Click__active').removeClass('controls-Click__active');
      });
   }

   /**
    * Миксин, добавляющий поведение хранения выбранного элемента. Всегда только одного
    * @mixin SBIS3.CONTROLS.Clickable
    * @public
    * @author Крайнов Дмитрий Олегович
    */

   var Clickable = /**@lends SBIS3.CONTROLS.Clickable.prototype  */{
      /**
       * @event onActivated При активации кнопки (клик мышкой, кнопки клавиатуры)
       * @param {$ws.proto.EventObject} eventObject Дескриптор события.
       * @example
       * <pre>
       *    onActivated: function(event){
       *       $ws.helpers.question('Продолжить?');
       *    }
       * </pre>
       */
      $protected: {
         _options: {

         },
         _keysWeHandle: [
            $ws._const.key.enter,
            $ws._const.key.space
         ]
      },

      $constructor: function() {
         this._publish('onActivated');
         var self = this;

         this._container.mousedown(function (e) {
            if (e.which == 1 && self.isEnabled()) {
               self._container.addClass('controls-Click__active');
            }
            //return false;
         });
      },
      _clickHandler : function() {

      },

      _notifyOnActivated : function(originalEvent) {
         this._notify('onActivated', originalEvent);
      },

      _keyboardHover: function(event){
         if (this.isEnabled()) {
            this._clickHandler(event);
            this._notifyOnActivated(event);
         }
      },

      instead : {
         //TODO сделано через onClickHandler WS в базовом контроле
         _onClickHandler: function(e) {
            if (this.isEnabled()) {
               this._container.removeClass('controls-Click__active');
               this._clickHandler(e);
               this._notifyOnActivated(e);
               if (!this._isControlActive) {
                  this.setActive(true);
               }
            }
            e.stopImmediatePropagation();
         }
      }
   };

   return Clickable;

});/**
 * Created by kraynovdo on 27.10.2014.
 */
