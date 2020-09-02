import {ISearchOptions} from 'Controls/interface';
import {NewSourceController} from 'Controls/dataSource';
import {QueryWhereExpression} from 'Types/source';
import {RecordSet} from 'Types/collection';

export interface IControllerClassOptions extends ISearchOptions {
   sourceController: NewSourceController;
   searchValue?: string;
}

export default class Controller {

   protected _options: IControllerClassOptions = null;

   protected _searchValue: string = '';

   constructor(options: IControllerClassOptions) {
      this._options = options;
   }

   private _updateFilter(filter: QueryWhereExpression<unknown>): Promise<RecordSet> {
      const sourceController = this._options.sourceController;

      sourceController.setFilter(filter);
      return sourceController.load().then((v) =>
         sourceController.setItems(v)
      );
   }

   reset(): Promise<void> {
      const filter = {...this._options.sourceController.getFilter()};
      delete filter[this._options.searchParam];
      this._searchValue = '';
      return this._updateFilter(filter).then();
   }

   search(value: string): Promise<RecordSet> {
      const filter: QueryWhereExpression<unknown> = {...this._options.sourceController.getFilter()};

      filter[this._options.searchParam] = this._searchValue = value;

      return this._updateFilter(filter);
   }

   update(options: Partial<IControllerClassOptions>): void {
      if (options.hasOwnProperty('searchValue')) {
         if (options?.searchValue !== this._searchValue) {
            if (options.searchValue) {
               this.search(options.searchValue).then();
            } else {
               this.reset().then();
            }
         }
      }
      this._options = {
         ...this._options,
         ...options
      };
   }
}
