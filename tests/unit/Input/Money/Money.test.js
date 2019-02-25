define(
   [
      'Core/core-instance',
      'Controls/Input/Money',
      'unit/resources/TemplateUtil',
      'unit/Input/Base/InputUtility',
      'wml!unit/Input/Money/ZeroValueTest',
      'wml!unit/Input/Money/EmptyValueTest'
   ],
   function(instance, Money, TemplateUtil, InputUtility, zeroValueTemplate, emptyValueTemplate) {
      'use strict';

      describe('Controls.Input.Money', function() {
         var ctrl, calls;

         beforeEach(function() {
            calls = [];
            ctrl = new Money();
            var beforeMount = ctrl._beforeMount;

            ctrl._beforeMount = function() {
               beforeMount.apply(this, arguments);

               ctrl._children[this._fieldName] = {
                  selectionStart: 0,
                  selectionEnd: 0,
                  value: '',
                  focus: function() {
                  },
                  setSelectionRange: function(start, end) {
                     this.selectionStart = start;
                     this.selectionEnd = end;
                  }
               };
            };
         });

         describe('The integer and the fractional part in the reading mode.', function() {
            beforeEach(function() {
               ctrl._beforeMount({
                  value: ''
               });
               ctrl._readOnlyField.template = TemplateUtil.clearTemplate(ctrl._readOnlyField.template);
            });
            it('Empty value', function() {
               ctrl._readOnlyField.scope.value = '';

               assert.equal(ctrl._readOnlyField.template(ctrl._readOnlyField.scope), emptyValueTemplate({}));
            });
            it('Zero value', function() {
               ctrl._readOnlyField.scope.value = '0.00';

               assert.equal(ctrl._readOnlyField.template(ctrl._readOnlyField.scope), zeroValueTemplate({}));
            });
         });

         describe('User input.', function() {
            it('Enter "0" in the empty field.', function() {
               InputUtility.init(ctrl);
               InputUtility.insert(ctrl, '0');
               InputUtility.triggerInput(ctrl);

               assert.equal(ctrl._viewModel.value, '0.00');
               assert.deepEqual(ctrl._viewModel.selection, {
                  start: 1,
                  end: 1
               });
            });
         });
      });
   }
);
