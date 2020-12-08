import {TemplateFunction} from 'UI/Base';
import Row, {IOptions as IRowOptions} from './Row';
import DataCell from './DataCell';
import IMarkable from '../interface/IMarkable';

export interface IOptions<T> extends IRowOptions<T> {
}

export default class DataRow<T> extends Row<T> implements IMarkable {
    protected _$columnItems: Array<DataCell<T, this>>;

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;
    readonly Markable: boolean = true;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction|string): TemplateFunction|string {
        const templateFromProperty = itemTemplateProperty ? this.getContents().get(itemTemplateProperty) : '';
        return templateFromProperty || userTemplate || this.getDefaultTemplate();
    }
}

Object.assign(Row.prototype, {
    '[Controls/_display/grid/DataRow]': true,
    _moduleName: 'Controls/display:GridDataRow',
    _cellModule: 'Controls/display:GridDataCell',
    _instancePrefix: 'grid-data-row-'
});
