import { mixin } from 'Types/util';
import TreeItem, { IOptions as ITreeItemOptions } from './TreeItem';
import GridRowMixin from './GridRowMixin';
import GridCell from './GridCell';
import { IOptions as IGridRowOptions } from './GridRow';
import TreeGridCollection from './TreeGridCollection';

export interface IOptions<T> extends IGridRowOptions<T>, ITreeItemOptions<T> {
    owner: TreeGridCollection<T>;
}

export default class TreeGridRow<T> extends mixin<TreeItem<any>, GridRowMixin<any>>(TreeItem, GridRowMixin) {
    readonly '[Controls/_display/GridRow]': boolean;
    readonly '[Controls/_display/TreeGridRow]': boolean;

    constructor(options: IOptions<T>) {
        super(options);
        GridRowMixin.call(this, options);
    }

    // region Expander

    shouldDisplayExpanderBlock(column: GridCell<T, TreeGridRow<T>>): boolean {
        const columnIndex = column.getColumnIndex();
        const hasMultiSelect = this._$owner.getMultiSelectVisibility() !== 'hidden';
        return columnIndex === 0 && !hasMultiSelect || columnIndex === 1 && hasMultiSelect;
    }

    // endregion Expander

    // TODO duplicate code with GridRow. Нужно придумать как от него избавиться.
    //  Проблема в том, что mixin не умеет объединять одинаковые методы, а логику Grid мы добавляем через mixin
    // region overrides

    setMultiSelectVisibility(multiSelectVisibility: string): boolean {
        const isChangedMultiSelectVisibility = super.setMultiSelectVisibility(multiSelectVisibility);
        if (isChangedMultiSelectVisibility) {
            this._reinitializeColumns();
        }
        return isChangedMultiSelectVisibility;
    }

    setMarked(marked: boolean, silent?: boolean): void {
        const changed = marked !== this.isMarked();
        super.setMarked(marked, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setSelected(selected: boolean|null, silent?: boolean): void {
        const changed = this._$selected !== selected;
        super.setSelected(selected, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setActive(active: boolean, silent?: boolean): void {
        const changed = active !== this.isActive();
        super.setActive(active, silent);
        if (changed) {
            this._redrawColumns('all');
        }
    }

    // endregion overrides
}

Object.assign(TreeGridRow.prototype, {
    '[Controls/_display/TreeGridRow]': true,
    '[Controls/_display/GridRow]': true,
    _cellModule: 'Controls/display:TreeGridCell',
    _moduleName: 'Controls/display:TreeGridRow'
});
