define('Controls-demo/AsyncTest/Childs/CaseSecond/Async/Element',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/CaseSecond/Async/Element',
   ], function (Base, template) {
      'use strict';

      var elementModule = Base.Control.extend({
         _template: template,

         _beforeMount: function (options) {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  resolve();
               }, options.delay);
            });
         },

      });

      return elementModule;
   });
