import { mixin } from 'Types/util';
import { OptionsToPropertyMixin } from 'Types/entity';
import { THeader } from '../_grid/interface/IHeaderCell';
import GridCollection from './GridCollection';
import GridHeaderCell from './GridHeaderCell';

export interface IOptions<T> {
    owner: GridCollection<T>;
    header: THeader;
}

type THeaderCells<T> = Array<GridHeaderCell<T>>;

export default class GridHeader<T> extends mixin<OptionsToPropertyMixin>(OptionsToPropertyMixin) {
    protected _$owner: GridCollection<T>;
    protected _$headerCells: THeaderCells<T>;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        this._$headerCells = this._prepareHeaderCells(options.header);
    }

    getHeaderClasses(theme: string): string {
        return `controls-Grid__header controls-Grid__header_theme-${theme}`;
    }

    getHeaderCells(): THeaderCells<T> {
        return this._$headerCells;
    }

    _prepareHeaderCells(header: THeader): THeaderCells<T> {
        const headerCells = [];
        header.forEach((elem) => {
            const headerCell = new GridHeaderCell({
                headerCell: elem,
                owner: this
            });
            headerCells.push(headerCell);
        });
        return headerCells;
    }
}

Object.assign(GridHeader.prototype, {
    _moduleName: 'Controls/display:GridHeader',
    _$headerCells: null
});
