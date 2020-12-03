/**
 * Библиотека контролов, которые реализуют плоский список, отображающийся в виде таблицы.
 * @library Controls/grid
 * @includes View Controls/_grid/Grid
 * @includes ItemTemplate Controls/grid:ItemTemplate
 * @includes ResultsTemplate Controls/grid:ResultsTemplate
 * @includes GroupTemplate Controls/grid:GroupTemplate
 * @includes HeaderContent Controls/grid:HeaderContent
 * @includes LadderWrapper Controls/grid:LadderWrapper
 * @includes ColumnTemplate Controls/grid:ColumnTemplate
 * @includes ResultColumnTemplate Controls/grid:ResultColumnTemplate
 * @includes RowEditor Controls/grid:RowEditor
 * @includes EditingEmptyTemplate Controls/grid:EditingEmptyTemplate
 * @includes IGridControl Controls/_grid/interface/IGridControl
 * @includes IColumn Controls/grid:IColumn
 * @includes ITagColumn Controls/grid:ITagColumn
 * @includes IHeaderCell Controls/_grid/interface/IHeaderCell
 * @includes IPropStorage Controls/_grid/interface/IPropStorage
 * @includes SortingSelector Controls/grid:SortingSelector
 * @public
 * @author Крайнов Д.О.
 */

import {default as View} from 'Controls/_grid/Grid';
import * as GridLayoutUtil from './_grid/utils/GridLayoutUtil';

import GridLayoutItemTemplate = require('wml!Controls/_grid/layout/grid/Item');
import TableLayoutItemTemplate = require('wml!Controls/_grid/layout/table/Item');

// FIXME: при обычном условном присвоении шаблона tmpl = isAny ? tmpl1 : tmpl2, переменной один раз присвоится значение и не будет меняться.
//  В таком случае возникает ошибка при открытии одной страницы из разных браузеров (Chrome и IE), с сервера всегда будет возвращаться один и тот же шаблон,
//  для того браузера, который первый открыл страницу.
//  Данным хахом мы подменяем шаблонную функцию и возвращаем правильную. Тоже самое, что вынести в отдельный шаблон и там условно вызвать паршл,
//  но быстрее по времени.
//  По словам Макса Крылова это ничего не сломает, если на функцию навесить флаги ядра.
//  Найти нормальное решение по https://online.sbis.ru/opendoc.html?guid=41a8dbab-93bb-4bc0-8533-6b12c0ec6d8d
const ItemTemplate = function() {
    return GridLayoutUtil.isFullGridSupport() ? GridLayoutItemTemplate.apply(this, arguments) : TableLayoutItemTemplate.apply(this, arguments);
};
ItemTemplate.stable = true;
ItemTemplate.isWasabyTemplate = true;

import ResultsTemplate = require('wml!Controls/_grid/ResultsTemplateResolver');
import GroupTemplate = require('wml!Controls/_grid/GroupTemplate');
import LadderWrapper = require('wml!Controls/_grid/LadderWrapper');
import ColumnTemplate = require('wml!Controls/_grid/layout/common/ColumnContent');
import ColumnLightTemplate = require('wml!Controls/_grid/layout/common/ColumnContentLight');

import HeaderContent = require('wml!Controls/_grid/HeaderContent');
import SortingButton from 'Controls/_grid/SortingButton';
import GridView = require('Controls/_grid/GridView');
import GridViewModel = require('Controls/_grid/GridViewModel');

import SortingSelector from 'Controls/_grid/SortingSelector';
import RowEditor = require('wml!Controls/_grid/RowEditor');
import * as ResultColumnTemplate from 'wml!Controls/_grid/layout/common/ResultCellContent';

import * as EditingEmptyTemplate from 'wml!Controls/_grid/emptyTemplates/Editing';

export {
    View,
    ItemTemplate,
    ResultsTemplate,
    ResultColumnTemplate,
    GroupTemplate,
    LadderWrapper,
    ColumnTemplate,
    ColumnLightTemplate,

    HeaderContent,
    SortingButton,
    GridView,
    GridViewModel,

    RowEditor,
    SortingSelector,

    EditingEmptyTemplate,

    GridLayoutUtil
};

export {
    TColumns,
    IColumn,
    ICellPadding,
    TCellAlign,
    TCellPaddingVariant,
    TCellVerticalAlign,
    TOverflow
} from './_grid/interface/IColumn';

export {ITagColumn} from './_grid/interface/ITagColumn';

export {
    THeader,
    IHeaderCell
} from './_grid/interface/IHeaderCell';

export {
    JS_SELECTORS as COLUMN_SCROLL_JS_SELECTORS,
    ColumnScroll,
    IColumnScrollOptions
} from './_grid/resources/ColumnScroll';

export {
    JS_SELECTORS as DRAG_SCROLL_JS_SELECTORS
} from './_grid/resources/DragScroll';
