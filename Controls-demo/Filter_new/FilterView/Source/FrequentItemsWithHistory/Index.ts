import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/FilterView/Source/FrequentItemsWithHistory/FrequentItemsWithHistory';
import {SyntheticEvent} from 'Vdom/Vdom';
import {object} from 'Types/util';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _source: unknown[] = [];

    protected _beforeMount(): void {
        this._source = [{
            name: 'department1',
            value: ['1'],
            resetValue: [],
            viewMode: 'frequent',
            textValue: 'Платформа',
            editorOptions: {
                keyProperty: 'id',
                emptyText: 'Все подразделения',
                displayProperty: 'title',
                source: new Memory({
                    keyProperty: 'id',
                    data: [{
                        id: '1',
                        title: 'Платформа'
                    },
                    {
                        id: '2',
                        title: 'ЭДО'
                    }]
                })
            }
        }];
    }

    protected _itemsChangedHandler(event: SyntheticEvent, items: unknown[]): void {
        this._source = object.clone(items);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
