/**
 * Библиотека контролов, которые служат для организации поиска в списках.
 * Подробнее об организации поиска и фильтрации данных в реестре {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/ здесь}.
 * @library Controls/search
 * @includes InputContainer Controls/_search/Input/Container
 * @includes Misspell Controls/_search/Misspell
 * @includes MisspellContainer Controls/_search/Misspell/Container
 * @includes Controller Controls/_search/Controller
 * @includes Input Controls/_search/Input/Search
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Search library
 * @library Controls/search
 * @includes InputContainer Controls/_search/Input/Container
 * @includes Misspell Controls/_search/Misspell
 * @includes MisspellContainer Controls/_search/Misspell/Container
 * @includes Controller Controls/_search/Controller
 * @includes Input Controls/_search/Input/Search
 * @public
 * @author Крайнов Д.О.
 */

import {default as Misspell} from 'Controls/_search/Misspell';
import {default as FilterController} from 'Controls/_search/FilterController';
import {default as ExpandableInput} from 'Controls/_search/Input/ExpandableInput/Search';
import InputContainer = require('Controls/_search/Input/Container');
import MisspellContainer = require('Controls/_search/Misspell/Container');
import Controller = require('Controls/_search/Controller');
import Input = require('Controls/_search/Input/Search');

import getSwitcherStrFromData = require('Controls/_search/Misspell/getSwitcherStrFromData');

export {default as _Search} from './_search/_Search';
export {default as _SearchController} from './_search/_SearchController';
export {default as ControllerClass} from './_search/ControllerClass';

export {default as NewControllerClass} from './_search/NewController/ControllerClass';
export {default as SearchInputContainer} from './_search/NewController/SearchInputContainer';
export {default as SearchController} from './_search/NewController/SearchController';
export {default as SearchDelay} from './_search/NewController/SearchDelay';

export {
   InputContainer,
   Misspell,
   MisspellContainer,
   Controller,
   Input,
   FilterController,
   ExpandableInput,

   getSwitcherStrFromData
};
