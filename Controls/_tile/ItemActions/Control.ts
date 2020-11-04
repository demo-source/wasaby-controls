import {TemplateFunction, Control, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_tile/ItemActions/Control';

export interface ITileItemActionsOptions extends IControlOptions {
    item: Record<string, any>;
}

/**
 * HOC над экшенами в preview шаблоне для ускорения синхронизации по ховеру на элемент
 * TODO: удалить после https://online.sbis.ru/opendoc.html?guid=5c209e19-b6b2-47d0-9b8b-c8ab32e133b0
 */
export default class TileItemActions extends Control<ITileItemActionsOptions> {
    protected _template: TemplateFunction = template;
    protected _item: Record<string, any> = null;

    protected _beforeMount(options: ITileItemActionsOptions): void {
        this._item = options.item;
    }

    protected _beforeUpdate(options: ITileItemActionsOptions): void {
        if (options.item !== this._options.item) {
            this._item = options.item;
        }
    }
}
