export interface IDateRangeOptions {
   startValue?: Date;
   endValue?: Date;
}

/**
 * Интерфейс для поддержки ввода диапазона дат.
 * @interface Controls/_dateRange/interfaces/IDateRange
 * @public
 */

/**
 * @name Controls/_dateRange/interfaces/IDateRange#startValue
 * @cfg {Date} Начальное значение диапазона.
 * @example
 * <pre>
 *    <Controls.dateRange:Input bind:startValue="_startValue" />
 *    <Controls.buttons:Button on:click="_sendButtonClick()" />
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _startValue: new Date(),
 *       _sendButtonClick() {
 *          this._sendData(this._startValue);
 *       }
 *       ...
 *   });
 * </pre>
 */

/*
 * @name Controls/_dateRange/interfaces/IDateRange#startValue
 * @cfg {Date} Beginning of period
 * @example
 * In this example you bind _startValue in control's state to the value of input field.
 * At any time of control's lifecycle, _startValue will contain the current start value of the input field.
 * <pre>
 *    <Controls.dateRange:Input bind:startValue="_startValue" />
 *    <Controls.buttons:Button on:click="_sendButtonClick()" />
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _startValue: new Date(),
 *       _sendButtonClick() {
 *          this._sendData(this._startValue);
 *       }
 *       ...
 *   });
 * </pre>
 */

/**
 * @name Controls/_dateRange/interfaces/IDateRange#endValue
 * @cfg {Date} Конечное значение диапазона.
 * @example
 * <pre>
 *    <Controls.Input.DateRange bind:endValue="_endValue" />
 *    <Controls.buttons:Button on:click="_sendButtonClick()" />
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _endValue: new Date(),
 *       _sendButtonClick() {
 *          this._sendData(this._endValue);
 *       }
 *       ...
 *   });
 * </pre>
 */

/*
 * @name Controls/_dateRange/interfaces/IDateRange#endValue
 * @cfg {Date} End of period
 * @example
 * In this example you bind _endValue in control's state to the value of input field.
 * At any time of control's lifecycle, _endValue will contain the current ens value of the input field.
 * <pre>
 *    <Controls.Input.DateRange bind:endValue="_endValue" />
 *    <Controls.buttons:Button on:click="_sendButtonClick()" />
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _endValue: new Date(),
 *       _sendButtonClick() {
 *          this._sendData(this._endValue);
 *       }
 *       ...
 *   });
 * </pre>
 */

/**
 * @event Controls/_dateRange/interfaces/IDateRange#rangeChanged Событие происходит при смещении диапазона.
 * @param {Date} startValue верхняя граница диапазона дат
 * @param {Date} endValue нижняя граница диапазона дат
 */

/**
 * @event Controls/_dateRange/interfaces/IDateRange#startValueChanged Происходит при изменении начального значения поля.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} value Новое значение поля.
 * @param {String} displayValue Текстовое значение поля.
 * @remark
 * Это событие должно использоваться для реагирования на изменения, вносимые пользователем в поле.
 * @example
 * В этом примере мы покажем, как осуществить "привязку" значения контрола к полю.
 * В первом поле мы делаем это вручную, используя событие valueChanged. Во втором поле используется формат "привязки".
 * Оба поля в этом примере будут иметь одинаковое поведение.
 * <pre>
 *    <Controls.dateRange:Input startValue="_fieldValue" on:startValueChanged="_valueChangedHandler()"/>
 *    <Controls.dateRange:Input bind:startValue="_anotherFieldValue"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ....
 *       _fieldValue: null,
 *       _valueChangedHandler(value, displayValue) {
 *          this._fieldValue = value;
 *          this._saveToDatabase(displayValue);
 *       },
 *       _anotherFieldValue: null
 *       ...
 *    });
 * </pre>
 */

/*
 * @event Controls/_dateRange/interfaces/IDateRange#startValueChanged Occurs when field start value was changed.
 * @param {Date} value New field value.
 * @param {String} displayValue Text value of the field.
 * @remark
 * This event should be used to react to changes user makes in the field.
 * @example
 * In this example, we show how you can 'bind' control's value to the field.
 * In the first field, we do it manually using valueChanged event. In the second field we use bind notation.
 * Both fields in this examples will have identical behavior.
 * <pre>
 *    <Controls.dateRange:Input startValue="_fieldValue" on:startValueChanged="_valueChangedHandler()"/>
 *    <Controls.dateRange:Input bind:startValue="_anotherFieldValue"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ....
 *       _fieldValue: null,
 *       _valueChangedHandler(value, displayValue) {
 *          this._fieldValue = value;
 *          this._saveToDatabase(displayValue);
 *       },
 *       _anotherFieldValue: null
 *       ...
 *    });
 * </pre>
 */

/**
 * @event Controls/_dateRange/interfaces/IDateRange#endValueChanged Происходит при изменении конечного значения поля.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} value Новое значение поля.
 * @param {String} displayValue Текстовое значение поля.
 * @remark
 * Это событие должно использоваться для реагирования на изменения, вносимые пользователем в поле.
 * @example
 * В этом примере мы покажем, как осуществить "привязку" значения контрола к полю.
 * В первом поле мы делаем это вручную, используя событие valueChanged. Во втором поле используется формат "привязки".
 * Оба поля в этом примере будут иметь одинаковое поведение.
 * <pre>
 *    <Controls.dateRange:Input endValue="_fieldValue" on:endValueChanged="_valueChangedHandler()"/>
 *    <Controls.dateRange:Input bind:endValue="_anotherFieldValue"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ....
 *       _fieldValue: null,
 *       _valueChangedHandler(value, displayValue) {
 *          this._fieldValue = value;
 *          this._saveToDatabase(displayValue);
 *       },
 *       _anotherFieldValue: null,
 *       ...
 *    });
 * </pre>
 */

/*
 * @event Controls/_dateRange/interfaces/IDateRange#endValueChanged Occurs when field end value was changed.
 * @param {Date} value New field value.
 * @param {String} displayValue Text value of the field.
 * @remark
 * This event should be used to react to changes user makes in the field.
 * @example
 * In this example, we show how you can 'bind' control's value to the field.
 * In the first field, we do it manually using valueChanged event. In the second field we use bind notation.
 * Both fields in this examples will have identical behavior.
 * <pre>
 *    <Controls.dateRange:Input endValue="_fieldValue" on:endValueChanged="_valueChangedHandler()"/>
 *    <Controls.dateRange:Input bind:endValue="_anotherFieldValue"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ....
 *       _fieldValue: null,
 *       _valueChangedHandler(value, displayValue) {
 *          this._fieldValue = value;
 *          this._saveToDatabase(displayValue);
 *       },
 *       _anotherFieldValue: null,
 *       ...
 *    });
 * </pre>
 */
