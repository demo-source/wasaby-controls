import { TemplateFunction } from 'UI/Base';
import FooterRow from './FooterRow';
import Cell, {IOptions as ICellOptions} from './Cell';
import { IColspanParams } from 'Controls/_grid/interface/IColumn';

export interface IOptions<T> extends ICellOptions<T> {
    owner: FooterRow<T>;
    template?: TemplateFunction;
}

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:FooterContent';

export default class FooterCell<T> extends Cell<T, FooterRow<T>> {

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getInstanceId(): string {
        return undefined;
    }

    // region Аспект "Объединение колонок"
    _getColspanParams(): IColspanParams {
        if (this._$column.startColumn && this._$column.endColumn) {
            const multiSelectOffset = this._$owner.hasMultiSelectColumn() ? 1 : 0;
            return {
                startColumn: this._$column.startColumn + multiSelectOffset,
                endColumn: this._$column.endColumn + multiSelectOffset
            };
        }
        return super._getColspanParams();
    }
    // endregion

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        let wrapperClasses = 'controls-GridView__footer__cell'
                          + ` controls-GridView__footer__cell_theme-${theme}`
                          + ` controls-background-${backgroundColorStyle}_theme-${theme}`;

        const cellPadding = this._$column.cellPadding;
        if (!this.getOwner().hasMultiSelectColumn() && this.isFirstColumn()) {
            wrapperClasses += ` controls-GridView__footer__cell__paddingLeft_${this._$owner.getLeftPadding()}_theme-${theme}`;
        } else {
            wrapperClasses += ' controls-Grid__cell_spacingLeft';
            if (cellPadding?.left) {
                wrapperClasses += `_${cellPadding.left.toLowerCase()}`;
            }
            wrapperClasses += `_theme-${theme}`;
        }

        if (this.isLastColumn()) {
            wrapperClasses += ` controls-GridView__footer__cell__paddingRight_${this._$owner.getRightPadding()}_theme-${theme}`;
        } else {
            wrapperClasses += ' controls-Grid__cell_spacingRight';
            if (cellPadding?.left) {
                wrapperClasses += `_${cellPadding.left.toLowerCase()}`;
            }
            wrapperClasses += `_theme-${theme}`;
        }

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
        }

        if (this.getOwner().getActionsTemplateConfig()?.itemActionsPosition === 'outside') {
            wrapperClasses += ` controls-GridView__footer__itemActionsV_outside_theme-${theme}`;
        }

        return wrapperClasses;
    }

    getWrapperStyles(containerSize?: number): string {
        return `${this.getColspan()} ${(this.getColspan() && containerSize) ? `width:${containerSize}px;` : ''}`;
    }

    getContentClasses(theme: string): string {
        return 'controls-Grid__footer-cell__content';
    }

    getTemplate(): TemplateFunction|string {
        return this._$column.template || DEFAULT_CELL_TEMPLATE;
    }
}

Object.assign(FooterCell.prototype, {
    '[Controls/_display/grid/FooterCell]': true,
    _moduleName: 'Controls/gridNew:GridFooterCell',
    _instancePrefix: 'grid-footer-cell-'
});
