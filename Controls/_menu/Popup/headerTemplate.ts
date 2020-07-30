import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_menu/Popup/headerTemplate');

class Header extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    static _theme: string[] = ['Controls/Classes', 'Controls/menu', 'Controls/popupTemplate'];

    static getDefaultOptions(): object {
        return {
            iconSize: 'm'
        };
    }
}
export default Header;
