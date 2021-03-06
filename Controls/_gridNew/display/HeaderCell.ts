/*  IHeaderCell
    Сделано:
    align Выравнивание содержимого ячейки по горизонтали.
    caption Текст заголовка ячейки.
    sortingProperty Свойство, по которому выполняется сортировка.
    template Шаблон заголовка ячейки.
    textOverflow Поведение текста, если он не умещается в ячейке
    valign Выравнивание содержимого ячейки по вертикали.
    startColumn Порядковый номер колонки, на которой начинается ячейка.
    startRow Порядковый номер строки, на которой начинается ячейка.
    endColumn Порядковый номер колонки, на которой заканчивается ячейка.
    endRow Порядковый номер строки, на которой заканчивается ячейка.

    Не сделано:
    isActionCell Поле, для определения ячейки действий
    templateOptions Опции, передаваемые в шаблон ячейки заголовка.
*/
import { TemplateFunction } from 'UI/Base';
import {IColspanParams, IHeaderCell, IRowspanParams} from 'Controls/grid';
import { IItemPadding } from 'Controls/display';
import HeaderRow from './HeaderRow';
import Cell, {IOptions as ICellOptions} from './Cell';

export interface IOptions<T> extends ICellOptions<T> {
    shadowVisibility?: string;
    backgroundStyle?: string;
    sorting?: string;
    cellPadding?: IItemPadding;
}

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:HeaderContent';

const FIXED_HEADER_Z_INDEX = 4;
const STICKY_HEADER_Z_INDEX = 3;

export default class HeaderCell<T> extends Cell<T, HeaderRow<T>> {
    protected _$owner: HeaderRow<T>;
    protected _$column: IHeaderCell;
    protected _$cellPadding: IItemPadding;
    protected _$align?: string;
    protected _$valign?: string;
    protected _$shadowVisibility?: string;
    protected _$backgroundStyle?: string;
    protected _$sorting?: string;

    get shadowVisibility(): string {
        return this._$shadowVisibility;
    }
    get backgroundStyle(): string {
        return this._$backgroundStyle;
    }
    constructor(options?: IOptions<T>) {
        super(options);
        if (!this.isCheckBoxCell()) {
            const {align, valign} = this.getContentOrientation();
            this._$align = align;
            this._$valign = valign;
        }
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

    isCheckBoxCell(): boolean {
        return this._$owner.hasMultiSelectColumn() && this._$owner.getHeaderConfig().indexOf(this._$column) === -1;
    }

    // region Аспект "Объединение колонок"
    _getColspanParams(): IColspanParams {
        if (this._$column.startColumn && this._$column.endColumn) {
            const multiSelectOffset = this.isCheckBoxCell() ? 0 : +this._$owner.hasMultiSelectColumn();
            return {
                startColumn: this._$column.startColumn + multiSelectOffset,
                endColumn: this._$column.endColumn + multiSelectOffset
            };
        }
        return super._getColspanParams();
    }
    // endregion

    // region Аспект "Объединение строк"
    _getRowspanParams(): Required<IRowspanParams> {
        const startRow = typeof this._$column.startRow === 'number' ? this._$column.startRow : (this._$owner.getIndex() + 1);
        let endRow;

        if (typeof this._$column.endRow === 'number') {
            endRow = this._$column.endRow;
        } else if (typeof this._$column.rowspan === 'number') {
            endRow = startRow + this._$column.rowspan;
        } else {
            endRow = startRow + 1;
        }

        return {
            startRow,
            endRow,
            rowspan: endRow - startRow
        };
    }
    getRowspan(): string {
        if (!this._$owner.isFullGridSupport()) {
            return this._getRowspanParams().rowspan;
        }
        const {startRow, endRow} = this._getRowspanParams();
        return `grid-row: ${startRow} / ${endRow};`;
    }
    // endregion

    getWrapperStyles(): string {
        let zIndex;
        if (this._$owner.hasColumnScroll()) {
            zIndex = this._$isFixed ? FIXED_HEADER_Z_INDEX : STICKY_HEADER_Z_INDEX;
        } else {
            zIndex = FIXED_HEADER_Z_INDEX;
        }
        let styles = super.getWrapperStyles();
        if (this._$owner.isFullGridSupport()) {
            styles += this.getRowspan();
        }
        styles += ` z-index: ${zIndex};`;
        return styles;
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string): string {
        let wrapperClasses = `controls-Grid__header-cell controls-Grid__cell_${style}`
                          + ` controls-Grid__header-cell_theme-${theme}`
                          + ` ${this._getWrapperPaddingClasses(theme)}`
                          + ` ${this._getColumnSeparatorClasses(theme)}`
                          + ` controls-background-${backgroundColorStyle || style}_theme-${theme}`;

        const isMultilineHeader = this._$owner.isMultiline();
        const isStickySupport = this._$owner.isStickyHeader();

        if (isMultilineHeader) {
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

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
        }

        // _private.getBackgroundStyle(this._options, true);
        return wrapperClasses;
    }

    getContentClasses(theme: string): string {
        const isMultiLineHeader = this._$owner.isMultiline();
        let contentClasses = 'controls-Grid__header-cell__content';
        contentClasses += ` controls-Grid__header-cell__content_theme-${theme}`;
        contentClasses += this._getContentSeparatorClasses(theme);
        if (isMultiLineHeader) {
            contentClasses += ` controls-Grid__row-multi-header__content_baseline_theme-${theme}`;
        } else {
            contentClasses += ` controls-Grid__row-header__content_baseline_theme-${theme}`;
        }
        if (this._$align) {
            contentClasses += ` controls-Grid__header-cell_justify_content_${this._$align}`;
        }
        return contentClasses;
    }

    protected _getContentSeparatorClasses(theme: string): string {
        let headerEndRow = this._$owner.getBounds().row.end;
        const isMultiLineHeader = this._$owner.isMultiline();
        let classes = '';
        if (isMultiLineHeader) {
            if (this._$column.endRow !== headerEndRow && this._$column.endRow - this._$column.startRow === 1) {
                classes += ` controls-Grid__cell_header-content_border-bottom_theme-${theme}`;
            }
        }
        return classes;
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

    setSorting(sorting: string): void {
        this._$sorting = sorting;
        this._nextVersion();
    }

    getSorting(): string {
        return this._$sorting;
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

    isLastColumn(): boolean {
        const isMultilineHeader = this._$owner.isMultiline();
        if (isMultilineHeader) {
            let headerEndColumn = this._$owner.getBounds().column.end;
            const currentEndColumn = this._getColspanParams().endColumn;
            if (this._$owner.hasMultiSelectColumn()) {
                headerEndColumn += 1;
            }
            if (this._$owner.hasItemActionsSeparatedCell()) {
                headerEndColumn -= 1;
            }
            return currentEndColumn === headerEndColumn;
        } else {
            return super.isLastColumn();
        }
    }

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
        const compatibleLeftPadding = cellLeftPadding ? `_${cellLeftPadding.toLowerCase()}` : (leftPadding === 'default' ? '' : `_${leftPadding}`);
        const compatibleRightPadding = cellRightPadding ? `_${cellRightPadding.toLowerCase()}` : (rightPadding === 'default' ? '' : `_${rightPadding}`);
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

        // Для хлебной крошки в первой ячейке хедера не нужен отступ слева.
        // Никак больше нельзя определить, что в ячейку передали хлебную крошку,
        // поэтому мы в header[0] проставляем isBreadCrumbs
        // TODO нужно сделать так, чтобы отступы задавались в header.
        //  И здесь бы уже звали толкьо this._$column.getLeftPadding()
        //  https://online.sbis.ru/opendoc.html?guid=686fb34b-fb74-4a11-8306-67b71e3ded0c
        if (this._$column.isBreadCrumbs) {
            paddingClasses += ` controls-Grid__cell_spacingFirstCol_null_theme-${theme}`;
        }

        return paddingClasses;
    }
}

Object.assign(HeaderCell.prototype, {
    '[Controls/_display/grid/HeaderCell]': true,
    _moduleName: 'Controls/gridNew:GridHeaderCell',
    _instancePrefix: 'grid-header-cell-',
    _$cellPadding: null,
    _$shadowVisibility: null,
    _$backgroundStyle: null,
    _$sorting: null
});
