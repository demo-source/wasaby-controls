/**
 * Модуль возвращает метод, с помощью которого можно запросить данные с учетом фильтрации и сортировки.
 * @remark
 * <h2>Аргументы функции</h2>
 *
 * Функция на вход приниает объект с полями:
 *
 * * source: SbisService - источник данных;
 * * filterButtonSource: Array - элементы {@link Controls/filter:Controller#filterButtonSource FilterButton};
 * * fastFilterSource: Array - элементы {@link Controls/filter:Controller#fastFilterSource FastFilter};
 * * navigation: object - навигация для получения данных;
 * * historyId: string - идентификатор для получения истории фильтрации;
 * * groupHistoryId: string - идентификатор для получения состояния группировки;
 * * filter: FilterObject - фильтр для получения данных;
 * * sorting: SortingObject - сортировка для получения данных;
 * * propStorageId: string - идентификатор стора, в котором хранится сохраненная пользовательская сортировка;
 *
 * @class Controls/_dataSource/requestDataUtil
 * @public
 * @author Сухоручкин А.С.
 * @public
 */

import {loadSavedConfig} from 'Controls/Application/SettingsController';
import {RecordSet} from 'Types/collection';
import {ICrud, PrefetchProxy} from 'Types/source';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {Logger} from 'UI/Utils';
import groupUtil from 'Controls/_dataSource/GroupUtil';
import SourceController from 'Controls/_dataSource/Controller';
import {IFilterItem} from 'Controls/filter';
import {INavigationOptionValue} from 'Controls/interface';

interface IHistoryItems {
   items: IFilterItem[];
}
type SortingObject = object[];
type FilterObject = Record<string, unknown>;

interface ISorting {
   sorting: SortingObject;
}
interface IFilter {
   filter: FilterObject;
   historyItems: IHistoryItems;
}
export interface IRequestDataResult {
   data: RecordSet;
   filter?: FilterObject;
   sorting?: SortingObject;
   historyItems?: IHistoryItems;
   collapsedGroups?: string[];
   error?: Error;
}

export interface ISourceConfig {
   source: ICrud | PrefetchProxy;
   filterButtonSource?: IFilterItem[];
   fastFilterSource?: object[];
   navigation?: INavigationOptionValue<unknown>;
   historyId?: string;
   groupHistoryId?: string;
   filter?: FilterObject;
   sorting?: SortingObject;
   historyItems?: IHistoryItems;
   propStorageId?: string;
   filterHistoryLoader: (filterButtonSource: object[], historyId: string) => {
      filterButtonSource: object[];
      filter: Record<string, any>;
      historyItems: object[];
   };
  error?: Error;
}

const HISTORY_FILTER_TIMEOUT = 1000;

export default function requestDataUtil(cfg: ISourceConfig): Promise<IRequestDataResult> {
   let sortingPromise;
   let filterPromise;
   let collapsedGroupsPromise;

   if (cfg.historyId && cfg.filterHistoryLoader instanceof Function) {
      filterPromise = cfg.filterHistoryLoader(cfg.filterButtonSource, cfg.historyId);
   } else if (cfg.historyId && cfg.filterButtonSource && cfg.filter) {
      if (requirejs.defined('Controls/filter')) {
         filterPromise = requirejs('Controls/filter').Controller.getCalculatedFilter(cfg);
      } else {
         filterPromise = import('Controls/filter').then((filterLib): Promise<IFilter> => {
            return filterLib.Controller.getCalculatedFilter(cfg);
         });
      }
      filterPromise = wrapTimeout(filterPromise, HISTORY_FILTER_TIMEOUT).catch(() => {
         Logger.info('Controls.dataSource:requestDataUtil: Данные фильтрации не загрузились за 1 секунду');
      });
   }
   if (cfg.propStorageId) {
      sortingPromise = loadSavedConfig(cfg.propStorageId, ['sorting']);
      sortingPromise = wrapTimeout(sortingPromise, HISTORY_FILTER_TIMEOUT).catch(() => {
         Logger.info('Controls.dataSource:requestDataUtil: Данные сортировки не загрузились за 1 секунду');
      });
   }
   if (cfg.groupHistoryId) {
      collapsedGroupsPromise = groupUtil.restoreCollapsedGroups(cfg.groupHistoryId);
   }

   return Promise.all([
       filterPromise,
      sortingPromise,
      collapsedGroupsPromise
   ]).then(([filterObject, sortingObject, collapsedGroups]: [IFilter, ISorting, string[]]) => {
      const filter = (filterObject ? filterObject.filter : cfg.filter) || {};
      const historyItems = filterObject ? filterObject.historyItems : null;
      const sorting = sortingObject ? sortingObject.sorting : cfg.sorting;
      if (collapsedGroups) {
         filter.collapsedGroups = collapsedGroups;
      }
      const result = {filter, sorting, historyItems, collapsedGroups};

      const sourceController = new SourceController({
         source: cfg.source,
         navigation: cfg.navigation,
         filter,
         sorting
      });
      return sourceController.load().then((data: RecordSet) => {
         return {...result, data};
      }).catch((data: Error) => {
         return {...result, data, error: data};
      });
   });
}
