/**
 * Библиотека контролов, которые служат для <a href="/doc/platform/developmentapl/interface-development/controls/list/filter-and-search/">организации фильтрации в списках</a>.
 * @library Controls/filter
 * @includes Selector Controls/_filter/Button
 * @includes Fast Controls/_filter/Fast
 * @includes View Controls/_filter/View
 * @includes ViewItemTemplate Controls/filter:ItemTemplate
 * @includes ButtonContainer Controls/_filter/Button/Container
 * @includes FastContainer Controls/_filter/Fast/Container
 * @includes ViewContainer Controls/_filter/View/Container
 * @includes Controller Controls/_filter/Controller
 * @includes IFilterItem Controls/_filter/View/interface/IFilterItem
 * @includes IFastFilter Controls/_filter/View/interface/IFastFilter
 * @includes IFilterButton Controls/_filter/View/interface/IFilterButton
 * @includes IPrefetch Controls/_filter/IPrefetch
 * @includes DateRangeEditor Controls/_filter/Editors/DateRange
 * @public
 * @author Крайнов Д.О.
 */

/*
 * filter library
 * @library Controls/filter
 * @includes Selector Controls/_filter/Button
 * @includes Fast Controls/_filter/Fast
 * @includes View Controls/_filter/View
 * @includes ViewItemTemplate Controls/filter:ItemTemplate
 * @includes ButtonContainer Controls/_filter/Button/Container
 * @includes FastContainer Controls/_filter/Fast/Container
 * @includes ViewContainer Controls/_filter/View/Container
 * @includes Controller Controls/_filter/Controller
 * @includes IFilterItem Controls/_filter/View/interface/IFilterItem
 * @includes IFastFilter Controls/_filter/View/interface/IFastFilter
 * @includes IFilterButton Controls/_filter/View/interface/IFilterButton
 * @includes IPrefetch Controls/_filter/IPrefetch
 * @includes Prefetch Controls/_filter/Prefetch
 * @includes DateRangeEditor Controls/_filter/Editors/DateRange
 * @public
 * @author Крайнов Д.О.
 */

import Selector = require('Controls/_filter/Button');
import Fast = require('Controls/_filter/Fast');
import View = require('Controls/_filter/View');
import ViewItemTemplate = require('wml!Controls/_filter/View/ItemTemplate');
import FastContainer = require('Controls/_filter/Fast/Container');
import HistoryUtils = require('Controls/_filter/HistoryUtils');
import FilterUtils = require('Controls/_filter/resetFilterUtils');

import {default as Controller} from 'Controls/_filter/Controller';
export {default as ControllerClass, IFilterControllerOptions} from './_filter/ControllerClass';
export {default as ButtonContainer} from './_filter/Button/Container';
export {default as ViewContainer} from './_filter/View/Container';
export {default as DateRangeEditor} from './_filter/Editors/DateRange';
export {default as Prefetch} from 'Controls/_filter/Prefetch';
export {default as mergeSource} from 'Controls/_filter/Utils/mergeSource';
export {IFilterItem} from 'Controls/_filter/View/interface/IFilterView';

export {
   Selector,
   Fast,
   View,
   ViewItemTemplate,
   FastContainer,
   Controller,
   HistoryUtils,
   FilterUtils
};
