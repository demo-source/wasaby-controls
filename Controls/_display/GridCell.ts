import { mixin } from 'Types/util';
import {
    OptionsToPropertyMixin,
    DestroyableMixin,
    InstantiableMixin,
    VersionableMixin,
    IInstantiable,
    IVersionable
} from 'Types/entity';
import GridRow from './GridRow';
import { TemplateFunction } from 'UI/Base';
import { IColumn, IColspanParams, IRowspanParams } from 'Controls/grid';
import {TMarkerClassName} from '../_grid/interface/ColumnTemplate';
import {IItemPadding} from '../_list/interface/IList';

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:ColumnTemplate';

export interface IOptions<T> extends IColspanParams, IRowspanParams {
    owner: GridRow<T>;
    column: IColumn;
    hiddenForLadder?: boolean;
}

export default class GridCell<T, TOwner extends GridRow<T>> extends mixin<
    DestroyableMixin,
    OptionsToPropertyMixin,
    InstantiableMixin,
    VersionableMixin
>(
    DestroyableMixin,
    OptionsToPropertyMixin,
    InstantiableMixin,
    VersionableMixin
) implements IInstantiable, IVersionable {
    readonly '[Types/_entity/IInstantiable]': boolean;
    protected _$owner: TOwner;
    protected _$column: IColumn;
    protected _$hiddenForLadder: boolean;

    getInstanceId: () => string;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    getTemplate(multiSelectTemplate?: TemplateFunction): TemplateFunction|string {
        return this._$column.template || DEFAULT_CELL_TEMPLATE;
    }

    shouldDisplayItemActions(): boolean {
        return this.isLastColumn() && (this._$owner.hasVisibleActions() || this._$owner.isEditing());
    }

    nextVersion(): void {
        this._nextVersion();
    }

    // region Аспект "Объединение колонок"

    _getColspanParams(): Required<IColspanParams> {
        const startColumn = typeof this._$column.startColumn === 'number' ? this._$column.startColumn : (this.getColumnIndex() + 1);
        let endColumn;

        if (typeof this._$column.endColumn === 'number') {
            endColumn = this._$column.endColumn;
        } else if (typeof this._$column.colspan === 'number') {
            endColumn = startColumn + this._$column.colspan;
        } else {
            endColumn = startColumn + 1;
        }

        return {
            startColumn,
            endColumn,
            colspan: endColumn - startColumn
        };
    }

    getColspan(): number {
        return this._getColspanParams().colspan;
    }

    getColspanStyles(): string {
        if (!this._$owner.isFullGridSupport()) {
            return '';
        }
        const {startColumn, endColumn} = this._getColspanParams();
        return `grid-column: ${startColumn} / ${endColumn};`;
    }

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

    getRowspan(): number {
        return this._getRowspanParams().rowspan;
    }

    getRowspanStyles(): string {
        if (!this._$owner.isFullGridSupport()) {
            return '';
        }
        const {startRow, endRow} = this._getRowspanParams();
        return `grid-row: ${startRow} / ${endRow};`;
    }

    // endregion

    // region Аспект "Лесенка"
    setHiddenForLadder(value: boolean): void {
        this._$hiddenForLadder = value;
    }
    // endregion

    // region Аспект "Отображение данных"
    getDisplayProperty(): string {
        return this._$column.displayProperty;
    }

    getContents(): T {
        return this._$owner.getContents();
    }

    get contents(): T {
        return this._$owner.getContents();
    }
    // endregion

    // region Аспект "Стилевое оформление"
    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        const hasColumnScroll = false;
        const hoverBackgroundStyle = this._$owner.getHoverBackgroundStyle() || 'default';

        let wrapperClasses = '';

        wrapperClasses += this._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        wrapperClasses += this._getWrapperSeparatorClasses(theme);

        if (hasColumnScroll) {
        } else {
            wrapperClasses += ' controls-Grid__cell_fit';
        }

        if (this._$owner.isEditing()) {
            const editingBackgroundStyle = this._$owner.getEditingBackgroundStyle();
            wrapperClasses += ` controls-Grid__row-cell-editing_theme-${theme}`;
            wrapperClasses += ` controls-Grid__row-cell-background-editing_${editingBackgroundStyle}_theme-${theme}`;
        } else if (templateHighlightOnHover !== false) {
            wrapperClasses += ` controls-Grid__row-cell-background-hover-${hoverBackgroundStyle}_theme-${theme}`;
        }

        /*const checkBoxCell = current.multiSelectVisibility !== 'hidden' && current.columnIndex === 0;
        const classLists = createClassListCollection('base', 'padding', 'columnScroll', 'columnContent');
        const backgroundStyle = current.backgroundStyle || current.style || 'default';
        const isFullGridSupport = GridLayoutUtil.isFullGridSupport();

        _private.prepareSeparatorClasses(current, classLists, theme);

        if (current.isEditing()) {
            classLists.base += ` controls-Grid__row-cell-background-editing_theme-${theme}`;
        } else {
            let backgroundHoverStyle = current.hoverBackgroundStyle || 'default';
            classLists.base += ` controls-Grid__row-cell-background-hover-${backgroundHoverStyle}_theme-${theme}`;
        }

        if (current.columnScroll && !current.isEditing()) {
            classLists.columnScroll += _private.getBackgroundStyle({backgroundStyle, theme}, true);
        }

        // Если включен множественный выбор и рендерится первая колонка с чекбоксом
        if (checkBoxCell) {
            classLists.base += ` controls-Grid__row-cell-checkbox_theme-${theme}`;
            classLists.padding = createClassListCollection('top', 'bottom');
            classLists.padding.top = `controls-Grid__row-checkboxCell_rowSpacingTop_${current.itemPadding.top}_theme-${theme}`;
            classLists.padding.bottom =  `controls-Grid__row-cell_rowSpacingBottom_${current.itemPadding.bottom}_theme-${theme}`;
        } else {
            classLists.padding = _private.getPaddingCellClasses(current, theme);
        }

        if (current.dispItem.isMarked() && current.markerVisibility !== 'hidden') {
            style = current.style || 'default';
            classLists.marked = `controls-Grid__row-cell_selected controls-Grid__row-cell_selected-${style}_theme-${theme}`;

            // при отсутствии поддержки grid (например в IE, Edge) фон выделенной записи оказывается прозрачным,
            // нужно его принудительно установить как фон таблицы
            if (!isFullGridSupport && !current.isEditing()) {
                classLists.marked += _private.getBackgroundStyle({backgroundStyle, theme}, true);
            }

            if (current.columnIndex === 0) {
                classLists.marked += ` controls-Grid__row-cell_selected__first-${style}_theme-${theme}`;
            }
            if (current.columnIndex === current.getLastColumnIndex()) {
                classLists.marked += ` controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-${style}_theme-${theme}`;
            }
        } else if (current.columnIndex === current.getLastColumnIndex()) {
            classLists.base += ` controls-Grid__row-cell__last controls-Grid__row-cell__last-${style}_theme-${theme}`;
        }

        if (!GridLayoutUtil.isFullGridSupport() && !(current.columns.length === (current.hasMultiSelect ? 2 : 1)) && self._options.fixIEAutoHeight) {
            classLists.base += ' controls-Grid__row-cell__autoHeight';
        }
        return classLists;*/
        return wrapperClasses;
    }

    // Only for partial grid support
    getRelativeCellWrapperClasses(theme: string): string {
        const rowSeparatorSize = this._$owner.getRowSeparatorSize();

        // Единственная ячейка с данными сама формирует высоту строки и не нужно применять хак для растягивания контента ячеек по высоте ячеек.
        // Подробнее искать по #grid_relativeCell_td.
        const shouldFixAlignment = this._$owner.getColumns().length === (this._$owner.getMultiSelectVisibility() !== 'hidden' ? 2 : 1);

        return 'controls-Grid__table__relative-cell-wrapper ' +
            `controls-Grid__table__relative-cell-wrapper_rowSeparator-${rowSeparatorSize}_theme-${theme} ` +
            (shouldFixAlignment ? 'controls-Grid__table__relative-cell-wrapper_singleCell' : '');
    }

    getWrapperStyles(): string {
        return `${this.getColspanStyles()} ${this.getRowspanStyles()}`;
    }

    getContentClasses(theme: string,
                      backgroundColorStyle: string,
                      cursor: string = 'pointer',
                      templateHighlightOnHover: boolean = true): string {
        const hoverBackgroundStyle = this._$owner.getHoverBackgroundStyle() || 'default';

        let contentClasses = 'controls-Grid__row-cell__content';

        contentClasses += ` controls-Grid__row-cell__content_baseline_default_theme-${theme}`;
        contentClasses += ` controls-Grid__row-cell_cursor-${cursor}`;

        contentClasses += this._getContentPaddingClasses(theme);

        contentClasses += ' controls-Grid__row-cell_withoutRowSeparator_size-null_theme-default';

        if (this._$column.align) {
            contentClasses += ` controls-Grid__row-cell__content_halign_${this._$column.align}`;
        }

        if (this._$column.valign) {
            contentClasses += ` controls-Grid__cell_valign_${this._$column.valign} controls-Grid__cell-content_full-height`;
        }

        // todo Чтобы работало многоточие - нужна ещё одна обертка над contentTemplate. Задача пересекается с настройкой
        //      шаблона колонки (например, cursor на демо CellNoClickable)
        if (this._$column.textOverflow) {
            contentClasses += ` controls-Grid__cell_${this._$column.textOverflow}`;
        }

        if (this._$hiddenForLadder) {
            contentClasses += ' controls-Grid__row-cell__content_hiddenForLadder';
            contentClasses += ` controls-Grid__row-cell__content_hiddenForLadder_theme-${theme}`;
        }

        if (backgroundColorStyle) {
            contentClasses += ` controls-Grid__row-cell__content_background_${backgroundColorStyle}_theme-${theme}`;
        }

        if (templateHighlightOnHover !== false) {
            contentClasses += ` controls-Grid__item_background-hover_${hoverBackgroundStyle}_theme-${theme}`;
        }

        return contentClasses;
    }

    getContentStyles(): string {
        return '';
    }

    protected _getWrapperBaseClasses(theme: string, style: string, templateHighlightOnHover: boolean): string {
        let classes = '';

        const topPadding = this._$owner.getTopPadding();
        const bottomPadding = this._$owner.getBottomPadding();
        const isEditing = this._$owner.isEditing();
        const isDragged = this._$owner.isDragged();
        const preparedStyle = style === 'masterClassic' ? 'default' : style;
        const editingBackgroundStyle = this._$owner.getEditingBackgroundStyle();

        classes += ` controls-Grid__row-cell controls-Grid__cell_${preparedStyle}`;
        classes += ` controls-Grid__row-cell_${preparedStyle}_theme-${theme}`;

        if (isEditing) {
            classes += ` controls-ListView__item_editing_theme-${theme}`;
            classes += ` controls-ListView__item_background-editing_${editingBackgroundStyle}_theme-${theme}`;
        }

        if (isDragged) {
            classes += ` controls-ListView__item_dragging_theme-${theme}`;
        }

        if (this._$owner.isActive() && templateHighlightOnHover !== false) {
            classes += ` controls-GridView__item_active_theme-${theme}`;
        }

        if (topPadding === 'null' && bottomPadding === 'null') {
            classes += `controls-Grid__row-cell_small_min_height-theme-${theme} `;
        } else {
            classes += ` controls-Grid__row-cell_default_min_height-theme-${theme}`;
        }

        return classes;
    }

    protected _getWrapperSeparatorClasses(theme: string): string {
        const rowSeparatorSize = this._$owner.getRowSeparatorSize();
        let classes = '';

        if (rowSeparatorSize) {
            classes += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}_theme-${theme}`;
            classes += ` controls-Grid__rowSeparator_size-${rowSeparatorSize}_theme-${theme}`;
        } else {
            // Вспомогательные классы, вешаются на ячейку. Обеспечивают отсутствие "скачков" при смене rowSeparatorSize.
            classes += ' controls-Grid__no-rowSeparator';
            classes += ' controls-Grid__row-cell_withRowSeparator_size-null';
        }

        /*if (current.columnIndex > current.hasMultiSelect ? 1 : 0) {
            const columnSeparatorSize = _private.getSeparatorForColumn(current.columns, current.columnIndex, current.columnSeparatorSize);

            if (columnSeparatorSize !== null) {
                classLists.base += ' controls-Grid__row-cell_withColumnSeparator';
                classLists.columnContent += ` controls-Grid__columnSeparator_size-${columnSeparatorSize}_theme-${theme}`;
            }
        }*/
        return classes;
    }

    protected _getContentPaddingClasses(theme: string): string {
        let classes = '';

        const topPadding = this._$owner.getTopPadding();
        const bottomPadding = this._$owner.getBottomPadding();
        const leftPadding = this._$owner.getLeftPadding();
        const rightPadding = this._$owner.getRightPadding();

        /*if (columns[columnIndex].isActionCell) {
            return classLists;
        }*/
        // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
        /*if (params.isBreadCrumbs) {
            classLists.left += ` controls-Grid__cell_spacingFirstCol_null_theme-${theme}`;
        }*/

        // left <-> right
        const cellPadding = this._$column.cellPadding;

        if (this._$owner.getMultiSelectVisibility() === 'hidden' && this.isFirstColumn()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${leftPadding}_theme-${theme}`;
        } else if (!this.isFirstColumn()) {
            classes += ' controls-Grid__cell_spacingLeft';
            if (cellPadding?.left) {
                classes += `_${cellPadding.left}`;
            }
            classes += `_theme-${theme}`;
        }

        if (!this.isLastColumn()) {
            classes += ' controls-Grid__cell_spacingRight';
            if (cellPadding?.right) {
                classes += `_${cellPadding.right}`;
            }
            classes += `_theme-${theme}`;
        } else {
            classes += ` controls-Grid__cell_spacingLastCol_${rightPadding}_theme-${theme}`;
        }

        // top <-> bottom
        classes += ` controls-Grid__row-cell_rowSpacingTop_${topPadding}_theme-${theme}`;
        classes += ` controls-Grid__row-cell_rowSpacingBottom_${bottomPadding}_theme-${theme}`;

        return classes;
    }
    // endregion

    // region Аспект "Ячейка"
    getColumnConfig(): IColumn {
        return this._$column;
    }

    getColumnIndex(): number {
        return this._$owner.getColumnIndex(this);
    }

    isFirstColumn(): boolean {
        return this.getColumnIndex() === 0;
    }

    isLastColumn(): boolean {
        return this.getColumnIndex() === this._$owner.getColumnsCount() - 1;
    }

    // endregion

    // region Аспект "Множественный выбор"
    isMultiSelectColumn(): boolean {
        return this._$owner.getMultiSelectVisibility() !== 'hidden' && this.isFirstColumn();
    }
    // endregion

    // region Аспект "Маркер"

    // По умолчанию для абстрактной ячейки маркер отключен.
    shouldDisplayMarker(marker: boolean, markerPosition: 'left' | 'right' = 'left'): boolean {
        return false;
    }

    getMarkerClasses(theme: string,
                     style: string = 'default',
                     markerClassName: TMarkerClassName = 'default',
                     itemPadding: IItemPadding = {},
                     markerPosition: 'left' | 'right' = 'left'): string {
        return this._$owner.getMarkerClasses(theme, style, markerClassName, itemPadding, markerPosition);
    }
    // endregion
}

Object.assign(GridCell.prototype, {
    '[Controls/_display/GridCell]': true,
    _moduleName: 'Controls/display:GridCell',
    _instancePrefix: 'grid-cell-',
    _$owner: null,
    _$column: null,
    _$hiddenForLadder: null
});
