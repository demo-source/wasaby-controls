import TreeGridCell from 'Controls/_display/TreeGridCell';
import { TemplateFunction } from 'UI/Base';

export default class TreeGridNodeFooterCell<T> extends TreeGridCell<T> {
    readonly '[Controls/_display/TreeGridCell]': boolean;

    getTemplate(content?: TemplateFunction): TemplateFunction|string {
        return this._$owner.getNode().hasMoreStorage() ? this._$owner.getNodeFooterTemplateMoreButton() : content;
    }

    getContentClasses(
        theme: string,
        backgroundColorStyle: string,
        cursor: string = 'pointer',
        templateHighlightOnHover: boolean = true
    ): string {
        const rowSeparatorSize = this._$owner.getRowSeparatorSize() || 'null';

        let classes =
            'controls-TreeGrid__nodeFooterContent ' +
            `controls-TreeGrid__nodeFooterContent_theme-${theme} ` +
            `controls-TreeGrid__nodeFooterContent_rowSeparatorSize-${rowSeparatorSize}_theme-${theme}`;

        if (this._$owner.getColumns().length === 1) {
            /*if (!this.isFirstColumn()) {
                classes += ` controls-TreeGrid__nodeFooterCell_columnSeparator-size_${current.getSeparatorForColumn(columns, index, current.columnSeparatorSize)}_theme-${theme}`;
            }*/
            if (this._$owner.getMultiSelectVisibility() === 'hidden' && this.isFirstColumn()) {
                classes += ` controls-TreeGrid__nodeFooterContent_spacingLeft-${this._$owner.getLeftPadding()}_theme-${theme}`;
            }

            if (this.isLastColumn()) {
                classes += ` controls-TreeGrid__nodeFooterContent_spacingRight-${this._$owner.getRightPadding()}_theme-${theme}`;
            }
        } else {
            if (this._$owner.getMultiSelectVisibility() === 'hidden') {
                classes += ` controls-TreeGrid__nodeFooterContent_spacingLeft-${this._$owner.getLeftPadding()}_theme-${theme}`;
            }
            classes += ` controls-TreeGrid__nodeFooterContent_spacingRight-${this._$owner.getRightPadding()}_theme-${theme}`;
            classes += ' controls-Grid_columnScroll__fixed js-controls-ColumnScroll__notDraggable';
        }

        return classes;
    }

    getColspanStyles(colspan: boolean): string {
        return colspan !== false ? 'grid-column: 1 / ' + (this._$owner.getColumnsConfig().length + 1) : '';
    }
}

Object.assign(TreeGridNodeFooterCell.prototype, {
    '[Controls/_display/TreeGridNodeFooterCell]': true,
    _moduleName: 'Controls/display:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-footer-cell'
});
