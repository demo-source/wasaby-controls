import { ListView } from 'Controls/list';
import { TemplateFunction } from 'UI/Base';
import { TouchContextField as isTouch } from 'Controls/context';
import { Logger} from 'UI/Utils';
import { GridRow, GridLadderUtil, GridLayoutUtil } from 'Controls/display';
import * as GridTemplate from 'wml!Controls/_gridNew/Render/grid/GridView';
import * as GridItem from 'wml!Controls/_gridNew/Render/grid/Item';
import * as GroupTemplate from 'wml!Controls/_gridNew/Render/GroupTemplate';
import { prepareEmptyEditingColumns, prepareEmptyColumns } from 'Controls/Utils/GridEmptyTemplateUtil';
import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';
import { Model } from 'Types/entity';
import { SyntheticEvent } from 'Vdom/Vdom';
import ColumnScrollViewController, {COLUMN_SCROLL_JS_SELECTORS} from './ViewControllers/ColumnScroll';

const GridView = ListView.extend({
    _template: GridTemplate,
    _hoveredCellIndex: null,
    _hoveredCellItem: null,
    _groupTemplate: GroupTemplate,
    _isFullMounted: false,

    _columnScrollViewController: null,
    _columnScrollWrapperClasses: '',
    _columnScrollContentClasses: '',
    _dragScrollOverlayClasses: '',
    _columnScrollShadowClasses: '',
    _contentSizeForHScroll: 0,
    _horizontalScrollWidth: 0,
    _fixedColumnsWidth: 0,
    _scrollableColumnsWidth: 0,

    _beforeMount(options): void {
        let result = GridView.superclass._beforeMount.apply(this, arguments);
        this._prepareColumnsForEmptyEditingTemplate = this._prepareColumnsForEmptyEditingTemplate.bind(this);
        this._prepareColumnsForEmptyTemplate = this._prepareColumnsForEmptyTemplate.bind(this);

        if (options.columnScroll && options.columnScrollStartPosition === 'end' && options.isFullGridSupport) {
            // В таблице с горизонтальным скроллом изначально прокрученным в конец используется фейковая таблица.
            // Т.к. для отрисовки горизонтального скролла требуется знать размеры таблицы, инициализация горизонтального скролла
            // происходит на afterMount, который не вызывается на сервере. Чтобы измежать скачка, при оживлении таблицы с
            // прокрученными в конец колонками, на сервере строится фейковая таблица, состаящая из двух гридов.
            // Первый - фиксированные колонки, абсолютный блок, прижат к левому краю релативной обертки.
            // Второй - все остальные колонки, абсолютный блок, прижат к правому краю релативной обертки.
            // При построении настоящая таблица скрывается с помощью visibility и строится в обыччном порядке.
            // Затем проскроливается вконец и только после этого заменяет фейковую.
            // preventServerSideColumnScroll - запрещает построение с помощью данного механизма. Нужно например при поиске, когда
            // таблица перемонтируется. Простая проверка на window нам не подходит, т.к. нас интересует только первая отрисовка view
            // списочного контрола.
            this._showFakeGridWithColumnScroll = !options.preventServerSideColumnScroll;
        }

        if (options.columnScroll) {
            this._columnScrollViewController = this._createColumnScroll(options);
        }

        return result;
    },

    _afterMount(): void {
        this._actualizeColumnScroll(this._options);
        this._isFullMounted = true;
    },

    _beforeUpdate(newOptions): void {
        GridView.superclass._beforeUpdate.apply(this, arguments);
        const columnsChanged = !GridIsEqualUtil.isEqualWithSkip(this._options.columns, newOptions.columns,
            { template: true, resultTemplate: true });
        if (columnsChanged) {
            this._listModel.setColumns(newOptions.columns, false);
        }

        // Создание или разрушение контроллеров горизонтального скролла и скроллирования мышкой при изменении опций
        // columnScroll и dragScroll.
        if (this._columnScrollViewController) {
            const action = this._columnScrollViewControlle?.updateControllers(newOptions);
            if (action === 'columnScrollDisabled') {
                this._columnScrollViewController.destroy();
                this._applyColumnScrollChanges();
                this._columnScrollViewController = null;
            }
        } else if (newOptions.columnScroll) {
            this._columnScrollViewController = this._createColumnScroll(newOptions);
        }
    },

    _afterUpdate(oldOptions): void {
        GridView.superclass._afterUpdate.apply(this, arguments);
        this._actualizeColumnScroll(this._options);
    },

    _beforeUnmount(): void {
        GridView.superclass._beforeUnmount.apply(this, arguments);
        if (this._columnScrollViewController) {
            this._columnScrollViewController.destroy();
            this._columnScrollViewController = null;
        }
    },

    _resolveItemTemplate(options): TemplateFunction {
        return options.itemTemplate || this._resolveBaseItemTemplate(options);
    },

    _resolveBaseItemTemplate(options): TemplateFunction {
        return GridItem;
    },

    _getGridTemplateColumns(options): string {
        const hasMultiSelect = options.multiSelectVisibility !== 'hidden' && options.multiSelectPosition !== 'custom';

        if (!options.columns) {
            Logger.warn('You must set "columns" option to make grid work correctly!', this);
            return '';
        }
        const initialWidths = options.columns.map(((column) => column.width || GridLayoutUtil.getDefaultColumnWidth()));
        let columnsWidths: string[] = [];
        columnsWidths = initialWidths;
        const ladderStickyColumn = GridLadderUtil.getStickyColumn({
            columns: options.columns
        });
        if (ladderStickyColumn) {
            if (ladderStickyColumn.property.length === 2) {
                columnsWidths.splice(1, 0, '0px');
            }
            columnsWidths = ['0px'].concat(columnsWidths);
        }
        if (hasMultiSelect) {
            columnsWidths = ['max-content'].concat(columnsWidths);
        }

        if (options.isFullGridSupport && !!options.columnScroll && options.itemActionsPosition !== 'custom') {
            columnsWidths.push('0px');
        }

        return GridLayoutUtil.getTemplateColumnsStyle(columnsWidths);
    },

    _getGridViewWrapperClasses(): string {
        return `${this._columnScrollWrapperClasses} ${this.isColumnScrollVisible() ? COLUMN_SCROLL_JS_SELECTORS.COLUMN_SCROLL_VISIBLE : ''}`
    },

    _getGridViewClasses(options): string {
        let classes = `controls-Grid controls-Grid_${options.style}_theme-${options.theme}`;
        if (GridLadderUtil.isSupportLadder(options.ladderProperties)) {
            classes += ' controls-Grid_support-ladder';
        }
        classes += ` ${this._columnScrollContentClasses}`;
        return classes;
    },

    _getGridViewStyles(options): string {
        return this._getGridTemplateColumns(options);
    },

    _onItemMouseMove(event, collectionItem) {
        GridView.superclass._onItemMouseMove.apply(this, arguments);
        this._setHoveredCell(collectionItem.item, event.nativeEvent);
    },

    _onItemMouseLeave() {
        GridView.superclass._onItemMouseLeave.apply(this, arguments);
        this._setHoveredCell(null, null);
    },

    _onEditArrowClick(event: SyntheticEvent, row: GridRow<Model>): void {
        this._notify('editArrowClick', [row.getContents()]);
        event.stopPropagation();
    },

    _getCellIndexByEventTarget(event): number {
        if (!event) {
            return null;
        }
        const target = this._getCorrectElement(event.target);

        const gridRow = target.closest('.controls-Grid__row');
        if (!gridRow) {
            return null;
        }
        const gridCells = gridRow.querySelectorAll('.controls-Grid__row-cell');
        const currentCell = this._getCellByEventTarget(target);
        const multiSelectOffset = this._options.multiSelectVisibility !== 'hidden' ? 1 : 0;
        return Array.prototype.slice.call(gridCells).indexOf(currentCell) - multiSelectOffset;
    },

    _getCorrectElement(element: HTMLElement): HTMLElement {
        // В FF целью события может быть элемент #text, у которого нет метода closest, в этом случае рассматриваем как
        // цель его родителя.
        if (element && !element.closest && element.parentElement) {
            return element.parentElement;
        }
        return element;
    },

    _getCellByEventTarget(target: HTMLElement): HTMLElement {
        return target.closest('.controls-Grid__row-cell') as HTMLElement;
    },

    _setHoveredCell(item, nativeEvent): void {
        const hoveredCellIndex = this._getCellIndexByEventTarget(nativeEvent);
        if (item !== this._hoveredCellItem || hoveredCellIndex !== this._hoveredCellIndex) {
            this._hoveredCellItem = item;
            this._hoveredCellIndex = hoveredCellIndex;
            let container = null;
            let hoveredCellContainer = null;
            if (nativeEvent) {
                const target = this._getCorrectElement(nativeEvent.target);
                container = target.closest('.controls-ListView__itemV');
                hoveredCellContainer = this._getCellByEventTarget(target);
            }
            this._notify('hoveredCellChanged', [item, container, hoveredCellIndex, hoveredCellContainer]);
        }
    },

    // todo Переписать, сделать аналогично Footer/Header/Results
    _prepareColumnsForEmptyEditingTemplate(columns, topSpacing, bottomSpacing) {
        return prepareEmptyEditingColumns({
            gridColumns: this._options.columns,
            emptyTemplateSpacing: {
                top: topSpacing,
                bottom: bottomSpacing
            },
            isFullGridSupport: this._options.isFullGridSupport,
            hasMultiSelect: this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default',
            colspanColumns: columns,
            itemPadding: this._options.itemPadding || {},
            theme: this._options.theme,
            editingBackgroundStyle: (this._options.editingConfig ? this._options.editingConfig.backgroundStyle : 'default')
        });
    },

    _prepareColumnsForEmptyTemplate(columns, content, topSpacing, bottomSpacing, theme) {
        const ladderStickyColumn = GridLadderUtil.getStickyColumn({
            columns: this._options.columns
        });
        let gridColumns;
        if (ladderStickyColumn) {
            gridColumns = (ladderStickyColumn.property.length === 2 ? [{}, {}] : [{}]).concat(this._options.columns);
        } else {
            gridColumns = this._options.columns;
        }

        return prepareEmptyColumns({
            gridColumns,
            emptyTemplateSpacing: {
                top: topSpacing,
                bottom: bottomSpacing
            },
            isFullGridSupport: this._options.isFullGridSupport,
            hasMultiSelect: this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default',
            colspanColumns: content ? [{template: content}] : columns,
            itemPadding: this._options.itemPadding || {},
            theme: this._options.theme,
            afterPrepareCallback(column, index, columns): void {
                column.classes = 'controls-ListView__empty ' +
                    'controls-ListView__empty_theme-default ' +
                    `controls-ListView__empty_topSpacing_${topSpacing}_theme-${theme} ` +
                    `controls-ListView__empty_bottomSpacing_${bottomSpacing}_theme-${theme}`;
            }
        });
    },

    _onWrapperMouseEnter: function() {
        // При загрузке таблицы с проскроленным в конец горизонтальным скролом следует оживить таблицу при
        // вводе в нее указателя мыши, но после отрисовки thumb'а (скрыт через visibility) во избежание скачков
        if (this._showFakeGridWithColumnScroll) {
            this._showFakeGridWithColumnScroll = false;
        }
    },

    //#region COLUMN SCROLL

    isColumnScrollVisible(): boolean {
        return !!this._columnScrollViewController?.isVisible() && (
            !!this._listModel.getCount() ||
            this._listModel.isEditing() ||
            this._options.headerVisibility === 'visible' ||
            this._options.headerInEmptyListVisible === true
        );
    },

    _getColumnScrollFakeShadowStyles(position: 'start' | 'end'): string {
        return this._columnScrollViewController.getColumnScrollFakeShadowStyles(position);
    },
    _getColumnScrollFakeShadowClasses(position: 'start' | 'end'): string {
        return this._columnScrollViewController.getColumnScrollFakeShadowClasses(position, {
            needBottomPadding: this._options.needBottomPadding
        });
    },

    _getHorizontalScrollBarStyles(): string {
        if (!(this._columnScrollViewController && this.isColumnScrollVisible())) {
            return 'display: none;';
        }
        return this._columnScrollViewController.getScrollBarStyles(GridLadderUtil.stickyLadderCellsCount(
            this._options.columns,
            this._options.stickyColumn,
            this._listModel.getDraggingItem()
        ));
    },

    _createColumnScroll(options): ColumnScrollViewController {
        return new ColumnScrollViewController({
            ...options,
            hasMultiSelectColumn: options.multiSelectVisibility !== 'hidden' && options.multiSelectPosition !== 'custom',
            isActivated: !this._showFakeGridWithColumnScroll,
            onOverlayChangedCallback: (newState) => {
                if (newState) {
                    this._applyColumnScrollChanges();
                }
            }
        });
    },

    _actualizeColumnScroll(options) {
        return this._columnScrollViewController?.actualizeColumnScroll({
            ...options,
            scrollBar: this._children.horizontalScrollBar,
            containers: {
                header: this._children.header || this._children.results,
                wrapper: this._children.gridWrapper as HTMLElement,
                content: this._children.grid as HTMLElement,
                styles: this._children.columnScrollStylesContainer as HTMLStyleElement
            },
            hasMultiSelectColumn: options.multiSelectVisibility !== 'hidden' && options.multiSelectPosition !== 'custom',
            isActivated: !this._showFakeGridWithColumnScroll,
        }).then((result) => {
            if (result.status === 'created') {
                this._applyColumnScrollChanges();
            }
        });
    },

    _applyColumnScrollChanges() {
        this._columnScrollWrapperClasses = this._columnScrollViewController.getClasses('wrapper');
        this._columnScrollContentClasses = this._columnScrollViewController.getClasses('content');
        this._dragScrollOverlayClasses = this._columnScrollViewController.getClasses('overlay');

        const params = { needBottomPadding: this._options.needBottomPadding };
        const start = this._columnScrollViewController.getClasses('shadowStart', params);
        const end = this._columnScrollViewController.getClasses('shadowEnd', params);

        if (this._columnScrollShadowClasses?.start !== start || this._columnScrollShadowClasses?.end !== end) {
            this._columnScrollShadowClasses = { start, end };
        }

        const sizes = this._columnScrollViewController.getSizes();
        this._contentSizeForHScroll = sizes.contentSizeForHScroll;
        this._horizontalScrollWidth = sizes.scrollWidth;
        this._fixedColumnsWidth = sizes.fixedColumnsWidth;
        this._scrollableColumnsWidth = sizes.scrollableColumnsWidth;
    },

    _onHorizontalPositionChangedHandler(e, newScrollPosition: number): void {
        this._columnScrollViewController.onPositionChanged(newScrollPosition);
        this._applyColumnScrollChanges();
    },

    _onGridWrapperWheel(e) {
        if (this._columnScrollViewController && this.isColumnScrollVisible()) {
            this._columnScrollViewController.onScrollByWheel(e);
            this._applyColumnScrollChanges();
        }
    },

    _onScrollBarMouseUp(e) {
        e.stopPropagation();
        this._columnScrollViewController.onScrollEnded();
        this._applyColumnScrollChanges();
    },

    _onStartDragScrolling(e, startBy: 'mouse' | 'touch'): void {
        this._columnScrollViewController?.startDragScrolling(e, startBy);
        this._applyColumnScrollChanges();
    },

    _onMoveDragScroll(e, startBy: 'mouse' | 'touch') {
        if (this._columnScrollViewController) {
            const oldPosition = this._columnScrollViewController.getScrollPosition();
            const newPosition = this._columnScrollViewController.moveDragScroll(e, startBy);

            if (oldPosition !== newPosition) {
                this._applyColumnScrollChanges();
            }
        }
    },

    _onStopDragScrolling(e, startBy: 'mouse' | 'touch') {
        this._columnScrollViewController?.stopDragScrolling(e, startBy);
        this._applyColumnScrollChanges();
    },

    _resizeHandler(): void {
        this._actualizeColumnScroll(this._options);
    }

    //#endregion
});

GridView._theme = ['Controls/grid', 'Controls/Classes'];

GridView.contextTypes = () => {
    return {
        isTouch
    };
};

export default GridView;
