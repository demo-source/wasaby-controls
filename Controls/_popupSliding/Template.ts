import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupSliding/Template/Template';
import {ISlidingPanelTemplateOptions} from 'Controls/_popupSliding/interface/ISlidingPanelTemplate';
import {detection} from 'Env/Env';

export enum DESKTOP_MODE {
    STACK = 'stack',
    DIALOG = 'dialog'
}

const DESKTOP_TEMPLATE_BY_MODE = {
    [DESKTOP_MODE.DIALOG]: 'Controls/popupTemplate:Dialog',
    [DESKTOP_MODE.STACK]: 'Controls/popupTemplate:Stack'
};

const MOBILE_TEMPLATE = 'Controls/popupSliding:_SlidingPanel';

/**
 *  Базовый шаблон окна-шторки.
 * @class Controls/_popupSliding/Template
 * @implements Controls/_popupSliding/interface/ISlidingPanelTemplate
 * @public
 * @demo Controls-demo/PopupTemplate/SlidingPanel/Index
 * @author Красильников А.С.
 */
export default class Template extends Control<ISlidingPanelTemplateOptions> {
    protected _template: TemplateFunction = template;
    protected _adaptiveTemplateName: string = MOBILE_TEMPLATE;

    protected _beforeMount(options: ISlidingPanelTemplateOptions): void {
        this._adaptiveTemplateName = this._getDatapriveTemplate(options.slidingPanelOptions);
    }

    protected _beforeUpdate(options: ISlidingPanelTemplateOptions): void {
        if (options.slidingPanelOptions !== this._options.slidingPanelOptions) {
            this._adaptiveTemplateName = this._getDatapriveTemplate(options.slidingPanelOptions);
        }
    }

    private _getDatapriveTemplate(slidingPanelOptions: ISlidingPanelTemplateOptions['slidingPanelOptions']): string {
        return detection.isPhone ? MOBILE_TEMPLATE : DESKTOP_TEMPLATE_BY_MODE[slidingPanelOptions.desktopMode];
    }
}
