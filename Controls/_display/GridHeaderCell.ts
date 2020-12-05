/*  IHeaderCell
    Сделано:
    align Выравнивание содержимого ячейки по горизонтали.
    caption Текст заголовка ячейки.
    sortingProperty Свойство, по которому выполняется сортировка.
    template Шаблон заголовка ячейки.
    templateOptions Опции, передаваемые в шаблон ячейки заголовка.
    textOverflow Поведение текста, если он не умещается в ячейке
    valign Выравнивание содержимого ячейки по вертикали.

    Не сделано:
    isActionCell Поле, для определения ячейки действий
    startColumn Порядковый номер колонки, на которой начинается ячейка.
    startRow Порядковый номер строки, на которой начинается ячейка.
    endColumn Порядковый номер колонки, на которой заканчивается ячейка.
    endRow Порядковый номер строки, на которой заканчивается ячейка.
*/

import { TemplateFunction } from 'UI/Base';
import { IHeaderCell } from 'Controls/grid';
import GridHeaderRow from './GridHeaderRow';
import { IItemPadding } from './Collection';
import GridCell, {IOptions as IGridCellOptions} from './GridCell';

export interface IOptions<T> extends IGridCellOptions<T> {
}

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:HeaderContent';

export default class GridHeaderCell<T> extends GridCell<T, GridHeaderRow<T>> {
    protected _$owner: GridHeaderRow<T>;
    protected _$cellPadding: IItemPadding;
    protected _$align?: string;
    protected _$valign?: string;

    constructor(options?: IOptions<T>) {
        super(options);
        const {align, valign} = this.getContentOrientation();
        this._$align = align;
        this._$valign = valign;
    }

    getContentOrientation(): {align?: string; valign?: string} {
        /*
        * Выравнивание задается со следующим приоритетом
        * 1) Выравнивание заданное на ячейки шапки
        * 2) Если колонка растянута, то по умолчанию контент выравнивается по середине
        * 3) Контент выравнивается также, как контент колонки данных
        * 4) По верхнему левому углу
        * */
        const hasAlign = 'align' in this._$column;
        const hasValign = 'valign' in this._$column;
        let align = hasAlign ? this._$column.align : undefined;
        let valign = hasValign ? this._$column.valign : undefined;

        const get = (prop: 'align' | 'valign'): string | undefined => {
            const gridUnit = prop === 'align' ? 'Column' : 'Row';
            if (typeof this._$column[`start${gridUnit}`] !== 'undefined' &&
                typeof this._$column[`end${gridUnit}`] !== 'undefined' && (
                    (this._$column[`end${gridUnit}`] - this._$column[`start${gridUnit}`]) > 1)
            ) {
                return 'center';
            } else if (typeof this._$column[`start${gridUnit}`] !== 'undefined') {
                return this._$owner.getColumnsConfig()[this._$column[`start${gridUnit}`] - 1][prop];
            } else {
                return this._$owner.getColumnsConfig()[this._$owner.getHeaderConfig().indexOf(this._$column)][prop];
            }
        };

        if (!hasAlign) {
            align = get('align');
        }
        if (!hasValign) {
            valign = get('valign');
        }

        return { align, valign };
    }

    getWrapperClasses(theme: string, style: string = 'default'): string {
        let wrapperClasses = `controls-Grid__header-cell controls-Grid__cell_${style}`
                          + ` controls-Grid__header-cell_theme-${theme}`
                          + ` ${this._getWrapperPaddingClasses(theme)}`;

        const isMultiHeader = this._$owner.isMultiline();
        const isStickySupport = this._$owner.isStickyHeader();

        if (isMultiHeader) {
            wrapperClasses += ` controls-Grid__multi-header-cell_min-height_theme-${theme}`;
        } else {
            wrapperClasses += ` controls-Grid__header-cell_min-height_theme-${theme}`;
        }
        if (!isStickySupport) {
            wrapperClasses += ' controls-Grid__header-cell_static';
        }

        if (!this.isMultiSelectColumn()) {
            wrapperClasses += ' controls-Grid__header-cell_min-width';
        }

        if (this._$valign) {
            wrapperClasses += ` controls-Grid__header-cell__content_valign-${this._$valign}`;
        }

        // _private.getBackgroundStyle(this._options, true);
        return wrapperClasses;
    }

    getContentClasses(theme: string): string {
        const isMultiHeader = false;
        let contentClasses = 'controls-Grid__header-cell__content';
        contentClasses += ` controls-Grid__header-cell__content_theme-${theme}`;
        if (isMultiHeader) {
            contentClasses += ` controls-Grid__row-multi-header__content_baseline_theme-${theme}`;
        } else {
            contentClasses += ` controls-Grid__row-header__content_baseline_theme-${theme}`;
        }
        if (this._$align) {
            contentClasses += ` controls-Grid__header-cell_justify_content_${this._$align}`;
        }
        return contentClasses;
    }

    getColspanStyles(): string {
        if (!this._$owner.isFullGridSupport()) {
            return '';
        }
        let styles = super.getColspanStyles();

        if (this._$owner.isMultiline()) {
            const {startRow = 1, endRow = 2} = this._$column;
            styles += ` grid-row: ${startRow} / ${endRow};`;
        }

        return styles;
    }

    getTemplate(): TemplateFunction|string {
        return this._$column.template || DEFAULT_CELL_TEMPLATE;
    }

    getCaption(): string {
        // todo "title" - is deprecated property, use "caption"
        return this._$column.caption || this._$column.title;
    }

    getSortingProperty(): string {
        return this._$column.sortingProperty;
    }

    getAlign(): string {
        return this._$align;
    }

    getVAlign(): string {
        return this._$valign;
    }

    getTextOverflow(): string {
        return this._$column.textOverflow;
    }

    // todo <<< START >>> compatible with old gridHeaderModel
    get column(): IHeaderCell {
        return this._$column;
    }
    // todo <<< END >>>

    protected _getWrapperPaddingClasses(theme: string): string {
        let paddingClasses = '';
        const leftPadding = this._$owner.getLeftPadding();
        const rightPadding = this._$owner.getRightPadding();
        const isMultiSelectColumn = this.isMultiSelectColumn();
        const isFirstColumn = this.isFirstColumn();
        const isLastColumn = this.isLastColumn();
        const cellPadding = this._$cellPadding;
        const cellLeftPadding = cellPadding && cellPadding.left;
        const cellRightPadding = cellPadding && cellPadding.right;

        // todo <<< START >>> need refactor css classes names
        const compatibleLeftPadding = cellLeftPadding ? `_${cellLeftPadding}` : (leftPadding === 'default' ? '' : leftPadding);
        const compatibleRightPadding = cellRightPadding ? `_${cellRightPadding}` : (rightPadding === 'default' ? '' : rightPadding);
        // todo <<< END >>>

        if (!isMultiSelectColumn) {
            if (!isFirstColumn) {
                if (this._$owner.getMultiSelectVisibility() === 'hidden' || this.getColumnIndex() > 1) {
                    paddingClasses += ` controls-Grid__cell_spacingLeft${compatibleLeftPadding}_theme-${theme}`;
                }
            } else {
                paddingClasses += ` controls-Grid__cell_spacingFirstCol_${leftPadding}_theme-${theme}`;
            }
        }

        // right padding
        if (isLastColumn) {
            paddingClasses += ` controls-Grid__cell_spacingLastCol_${rightPadding}_theme-${theme}`;
        } else {
            paddingClasses += ` controls-Grid__cell_spacingRight${compatibleRightPadding}_theme-${theme}`;
        }

        return paddingClasses;
    }
}

Object.assign(GridHeaderCell.prototype, {
    _moduleName: 'Controls/display:GridHeaderCell',
    _instancePrefix: 'grid-header-cell-',
    _$cellPadding: null
});
