import {Control} from 'UI/Base';
import {descriptor} from 'Types/entity';
import template = require('wml!Controls/_dateRange/RelationButton/RelationButton');

const valueMap = {
    normal: 'byCapacity',
    byCapacity: 'normal'
};
/**
 * Кнопка для связывания периодов. Контрол, который может использоваться с {@link Controls/_dateRange/RelationController RelationController}.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dateRange.less переменные тем оформления} 
 *
 * @class Controls/_dateRange/RelationButton
 * @extends UI/Base:Control
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/RelationController
 *
 */

/*
 * Button for linking periods. The control that can be used with {@link Controls/_dateRange/RelationController RelationController}.
 *
 * @class Controls/_dateRange/RelationButton
 * @extends UI/Base:Control
 *
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/RelationController
 *
 */
const Component = Control.extend({
    _template: template,

    _valueChanged: function (event) {
        event.stopImmediatePropagation();
        this._notify('valueChanged', [valueMap[this._options.value]]);
        this._notify('relationButtonBindTypeChanged', [valueMap[this._options.value]], { bubbling: true });
    }
});

Component.getOptionTypes = function () {
    return {
        value: descriptor(String).oneOf([
            'normal',
            'byCapacity'
        ])
    };
};

Component.getDefaultOptions = function () {
    return {
        value: 'normal'
    };
};

Object.defineProperty(Component, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Component.getDefaultOptions();
   }
});

Component._theme = ['Controls/dateRange'];
export default Component;
