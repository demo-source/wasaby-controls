import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/EditInPlace/InputFontSize/InputFontSize';
import {Memory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import * as TitleCellTemplate from 'wml!Controls-demo/treeGrid/EditInPlace/InputFontSize/ColumnTemplate/Title';
import * as CountryCellTemplate from 'wml!Controls-demo/treeGrid/EditInPlace/InputFontSize/ColumnTemplate/Country';

import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = Gadgets.getGridColumnsForFlat();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
        this._columns[0].template = TitleCellTemplate;
        this._columns[2].template = CountryCellTemplate;
    }
}