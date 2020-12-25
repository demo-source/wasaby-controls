import {Control} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import ListEditorBase from 'Controls/_filterPanel/Editors/ListBase';
import {List} from 'Types/collection';
import {factory} from 'Types/chain';
import {ISelectorTemplate} from 'Controls/interface';

/**
 * Контрол используют в качестве редактора для выбора множества значений из списка на {@link Controls/filterPanel:View панели фильтров}.
 * @class Controls/_filterPanel/Editors/MultiSelectList
 * @extends Core/Control
 * @mixes Controls/_grid/interface/IGridControl
 * @mixes Controls/_interface/INavigation
 * @author Мельникова Е.А.
 * @public
 */

/**
 * @name Controls/_filterPanel/Editors/MultiSelectList#showSelectorCaption
 * @cfg {String} Заголовок для кнопки в подвале списка, которая открывает окно выбора из справочника.
 * @demo Controls-demo/filterPanel/MultiSelectListEditor/ShowSelectorCaption/Index
 * @default Другие
 */

/**
 * @name Controls/_filterPanel/Editors/MultiSelectList#additionalTextProperty
 * @cfg {String} Имя свойства, содержащего информацию об идентификаторе дополнительного столбца в списке.
 * @demo Controls-demo/filterPanel/MultiSelectListEditor/AdditionalTextProperty/Index
 */

/**
 * @name ontrols/_filterPanel/Editors/MultiSelectList#circleStyle
 * @cfg {String} Стиль отображения чекбокса в списке.
 * @variant default
 * @variant master
 * @default default
 */

export default class MultiSelectList extends ListEditorBase {
    protected _columns: object[] = null;

    protected _handleSelectedKeysChanged(event: SyntheticEvent, keys: string[]|number[]): void {
        this._notifyPropertyValueChanged(keys);
    }

    protected _handleSelectorResult(result: Model[]): void {
        const selectedKeys = [];
        result.forEach((item) => {
            selectedKeys.push(item.get(this._options.keyProperty));
        });
        this._notifyPropertyValueChanged(selectedKeys);
    }

    protected _getTemplateOptions(selectorOptions: ISelectorTemplate): object {
        return {
            ...selectorOptions.templateOptions,
            ...{
                selectedKeys: this._selectedKeys,
                selectedItems: this._getSelectedItems(),
                multiSelect: true
            }
        };
    }

    private _getSelectedItems(): List<Model> {
        const selectedItems = [];
        factory(this._selectedKeys).each((key) => {
            const record = this._items.getRecordById(key);
            if (record) {
                selectedItems.push(record);
            }
        });
        return new List({
            items: selectedItems
        });
    }

    static getDefaultOptions(): object {
        return {
            ...ListEditorBase.getDefaultOptions(),
            ...{
                multiSelect: true
            }
        };
    }
}
