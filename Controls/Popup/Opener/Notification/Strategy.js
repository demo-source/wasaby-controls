define('js!Controls/Popup/Opener/Notification/Strategy',
   [
      'Core/Abstract',
      'js!Controls/Popup/interface/IStrategy'
   ],
   function (Abstract, IStrategy) {

      /**
       * Стратегия позиционирования нотификационного окна.
       * @class Controls/Popup/Opener/Notification/Strategy
       * @mixes Controls/Popup/interface/IStrategy
       * @control
       * @public
       * @category Popup
       */
      var Strategy = Abstract.extend([IStrategy], {
         constructor: function (cfg) {
            Strategy.superclass.constructor.apply(this, arguments);
         },

         getPosition: function () {
            return {
               right: 16,
               bottom: 16
            };
         }
      });

      return Strategy;

   }
);