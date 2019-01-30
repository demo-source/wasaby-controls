define(
   [
      'Core/core-instance',
      'Controls/Input/Number',
      'tests/resources/ProxyCall',
      'Vdom/Vdom'
   ],
   function(instance, NumberInput, ProxyCall, Vdom) {
      'use strict';

      describe('Controls.Input.Number', function() {
         var ctrl, calls;

         beforeEach(function() {
            calls = [];
            ctrl = new NumberInput();

            var beforeMount = ctrl._beforeMount;

            ctrl._beforeMount = function() {
               beforeMount.apply(this, arguments);

               ctrl._children[this._fieldName] = {
                  setSelectionRange: function(start, end) {
                     this.selectionStart = start;
                     this.selectionEnd = end;
                  }
               };
            };
            ctrl._notify = ProxyCall.apply(ctrl._notify, 'notify', calls, true);
         });

         it('Checking default values of options.', function() {
            assert.deepEqual(NumberInput.getDefaultOptions(), {
               size: 'm',
               value: 0,
               style: 'info',
               placeholder: '',
               useGrouping: true,
               textAlign: 'left',
               autoComplete: false,
               onlyPositive: false,
               fontStyle: 'default',
               selectOnClick: false,
               showEmptyDecimals: false
            });
         });
         it('Checking types of options.', function() {
            assert.deepEqual(Object.keys(NumberInput.getOptionTypes()).sort(), [
               'size',
               'style',
               'tagStyle',
               'textAlign',
               'fontStyle',
               'useGrouping',
               'autoComplete',
               'onlyPositive',
               'selectOnClick',
               'showEmptyDecimals'
            ].sort());
         });

         it('The model belongs to the "Controls/Input/Number/ViewModel" class.', function() {
            ctrl._beforeMount({
               value: 0
            });

            assert.isTrue(instance.instanceOfModule(ctrl._viewModel, 'Controls/Input/Number/ViewModel'));
         });
         describe('Change event', function() {
            beforeEach(function() {
               ctrl._beforeMount({
                  value: 0
               });
               ctrl._viewModel = ProxyCall.set(ctrl._viewModel, ['displayValue'], calls);
            });
            it('ShowEmptyDecimals option equal true. Trailing zeros are not trimmed.', function() {
               ctrl._options.showEmptyDecimals = true;

               ctrl._changeHandler();

               assert.deepEqual(calls, [{
                  name: 'notify',
                  arguments: ['inputCompleted', [0, '0']]
               }]);
            });
         });
         describe('User input.', function() {
            beforeEach(function() {
               ctrl._getActiveElement = function() {
                  return ctrl._getField();
               };
            });
            it('The display value divided into triads is correctly converted to a value.', function() {
               ctrl._beforeMount({
                  value: '',
                  useGrouping: true
               });

               ctrl._getField().value = '1111';
               ctrl._getField().selectionStart = 4;
               ctrl._getField().selectionEnd = 4;
               ctrl._inputHandler(new Vdom.SyntheticEvent({}));

               assert.deepEqual(calls, [{
                  name: 'notify',
                  arguments: ['valueChanged', [1111, '1 111.0']]
               }]);
            });
            it('Triad partitioning is disabled. Enter 123456', function() {
               ctrl._beforeMount({
                  value: '',
                  useGrouping: false
               });

               ctrl._getField().value = '123456';
               ctrl._getField().selectionStart = 6;
               ctrl._getField().selectionEnd = 6;
               ctrl._inputHandler(new Vdom.SyntheticEvent({}));

               assert.deepEqual(calls, [{
                  name: 'notify',
                  arguments: ['valueChanged', [123456, '123456.0']]
               }]);
            });
         });
      });
   }
);
