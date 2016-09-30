define('js!SBIS3.CONTROLS.Demo.SliderDemo',
   [
      'js!SBIS3.CORE.CompoundControl',
      'html!SBIS3.CONTROLS.Demo.SliderDemo',
      'js!SBIS3.CONTROLS.Slider',
      'js!SBIS3.CONTROLS.NumberTextBox'
   ], function(CompoundControl, dotTplFn) {
   var moduleClass = CompoundControl.extend(/** @lends SBIS3.DemoCode.Slider.prototype */{
      _dotTplFn: dotTplFn,
      $protected: {
         _options: {
         }
      },
      $constructor: function() {

      }
   });
   return moduleClass;
});