import {IBaseSourceConfig, TNavigationDirection, TNavigationPagingMode} from 'Controls/_interface/INavigation';
import INavigationStore from './INavigationStore';
import {IQueryParams} from 'Controls/_interface/IQueryParams';
import {RecordSet} from 'Types/collection';
export default interface IParamsCalculator {
     hasMoreData(store: INavigationStore, direction: TNavigationDirection): boolean;
     getQueryParams(
         store: INavigationStore,
         navigationQueryConfig: IBaseSourceConfig,
         direction?: TNavigationDirection,
         paramsCallback?: Function): IQueryParams;
     updateQueryProperties(
         store: INavigationStore,
         list: RecordSet,
         metaMore: object | number | boolean,
         navigationQueryConfig: IBaseSourceConfig,
         direction: TNavigationDirection
     ): any;
     shiftToEdge(
         store: INavigationStore,
         direction: TNavigationDirection,
         shiftMode: TNavigationPagingMode,
         navigationQueryConfig: IBaseSourceConfig
     ): IBaseSourceConfig;
     updateQueryRange(store: INavigationStore, list: RecordSet): void;
     destroy(): void;
}
