import QueryParamsController from  'Controls/_source/QueryParamsController';
import {IQueryParamsController} from 'Controls/_source/interface/IQueryParamsController';
import {default as PageQueryParamsController} from 'Controls/_source/QueryParamsController/PageQueryParamsController';
import {Direction, IAdditionalQueryParams} from 'Controls/source';
import {IBaseSourceConfig, INavigationSourceConfig} from 'Controls/interface';
import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {equal, ok} from 'assert';

class FakeController implements IQueryParamsController {
   destroy(): void {}

   getAllDataCount(rootKey?: string | number): boolean | number {
      return undefined;
   }

   getLoadedDataCount(): number {
      return 0;
   }

   hasMoreData(direction: Direction, rootKey: string | number): boolean | undefined {
      return undefined;
   }

   prepareQueryParams(direction: Direction, callback?, config?: IBaseSourceConfig): IAdditionalQueryParams {
      return undefined;
   }

   setConfig(config: INavigationSourceConfig): void {}

   setEdgeState(direction: Direction): void {}

   setState(model: Collection<Record<any, any>>): void {}

   updateQueryProperties(list?: RecordSet | { [p: string]: unknown }, direction?: Direction, root?: string | number):
       void {}
}

const recordSetWithMultiNavigation = new RecordSet();
recordSetWithMultiNavigation.setMetaData({
   more: new RecordSet({
      rawData: [
         {
            id: 1,
            nav_result: true
         },
         {
            id: 2,
            nav_result: false
         }
      ]
   }),
   path: new RecordSet()
});

const recordSetWithSingleNavigation = new RecordSet();
recordSetWithSingleNavigation.setMetaData({
   more: true
});

describe('Controls/_source/QueryParamsController', () => {
   let controller;
   let queryParamsWithPageController;

   beforeEach(() => {
      controller = new QueryParamsController({
         controllerClass: FakeController
      });
      queryParamsWithPageController = new QueryParamsController({
         controllerClass: PageQueryParamsController,
         controllerOptions: {
            page: 0,
            pageSize: 2
         }
      });
   });

   it('prepareQueryParams', () => {
      controller.updateQueryProperties(recordSetWithMultiNavigation);
      const queryParams = controller.prepareQueryParams('down', () => {}, {}, true);
      equal(queryParams.length, 2);
   });

   describe('updateQueryProperties', () => {
      it('controller created for every root in multiNavigation', () => {
         controller.updateQueryProperties(recordSetWithMultiNavigation);
         ok(!!controller.getController(1));
         ok(!!controller.getController(2));
      });
      it('path in metaData after updateQueryProperties', () => {
         queryParamsWithPageController.updateQueryProperties(recordSetWithMultiNavigation);
         ok(recordSetWithMultiNavigation.getMetaData().path);
      });
   });

   describe('hasMoreData', () => {
      it('hasMoreData for multi navigation query result', () => {
         queryParamsWithPageController.updateQueryProperties(recordSetWithMultiNavigation);
         ok(queryParamsWithPageController.hasMoreData('down', 1));
         equal(queryParamsWithPageController.hasMoreData('down', 2), false);
         equal(queryParamsWithPageController.hasMoreData('down'), true);
      });

      it('hasMoreData for single navigation query result', () => {
         queryParamsWithPageController.updateQueryProperties(recordSetWithSingleNavigation, 'down');
         ok(queryParamsWithPageController.hasMoreData('down'));
      });
   });
});
