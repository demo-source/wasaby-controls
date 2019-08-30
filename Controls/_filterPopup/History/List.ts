/**
 * Created by kraynovdo on 31.01.2018.
 */
import BaseControl = require('Core/Control');
import template = require('wml!Controls/_filterPopup/History/List');
import {isEqual} from 'Types/object';
import Utils = require('Types/util');
import {HistoryUtils} from 'Controls/filter';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';
import HistoryStorage = require('SBIS3.CONTROLS/History/HistoryList');
import {Constants} from 'Controls/history';
import ParallelDeferred = require('Core/ParallelDeferred');
import isEmpty = require('Core/helpers/Object/isEmpty');
import {convertToFilterStructure, convertToSourceData} from 'Controls/_filterPopup/converterFilterStructure';
import 'css!theme?Controls/filterPopup';

   var MAX_NUMBER_ITEMS = 5;

   const FILTER_STATUS = {
      FOR_ME: 0,
      FOR_ALL: 1
   };

   var getPropValue = Utils.object.getPropertyValue.bind(Utils);

   var _private = {
      getItemId: function(item) {
         let id;
         if (item.hasOwnProperty('id')) {
            id = getPropValue(item, 'id');
         } else {
            id = getPropValue(item, 'name');
         }
         return id;
      },

      getStringHistoryFromItems: function(items, resetValues) {
         var textArr = [];
         factory(items).each(function(elem) {
            var value = getPropValue(elem, 'value'),
               resetValue = resetValues[_private.getItemId(elem)],
               textValue = getPropValue(elem, 'textValue'),
               visibility = getPropValue(elem, 'visibility');

            if (!isEqual(value, resetValue) && (visibility === undefined || visibility) && textValue) {
               textArr.push(textValue);
            }
         });
         return textArr.join(', ');
      },

      getResetValues: function(items) {
         var result = {};
         factory(items).each(function(item) {
            result[_private.getItemId(item)] = getPropValue(item, 'resetValue');
         });
         return result;
      },

      getCaptions: function(items) {
         var result = {};
         factory(items).each(function(item) {
            result[_private.getItemId(item)] = getPropValue(item, 'caption');
         });
         return result;
      },

      onResize: function(self) {
         if (self._options.orientation === 'vertical)') {
            var arrowVisibility = self._arrowVisible;
            self._arrowVisible = self._options.items.getCount() > MAX_NUMBER_ITEMS;

            if (arrowVisibility !== self._arrowVisible) {
               self._isMaxHeight = true;
               self._forceUpdate();
            }
         }
      },

      removeRecord: function(self, item, record) {
         let storage = self._historyStorage;
         if (item.get('data') && item.get('data').get('globalParams')) {
            storage = self._historyGlobalStorage;
         }
         let recordIndex = storage.getIndexByValue('id', item.get('id'));
         if (recordIndex !== -1) {
            // if globalParams have changed, then we need to re-save the item
            storage.removeAt(recordIndex, record.get('globalParams') !== item.get('data').get('globalParams'));
         }
      },

      minimizeHistoryItems: function(record) {
         let historyItems = [];
         factory(record.get('filterPanelItems')).each((item) => {
            delete item.editable;
            delete item.caption;
            historyItems.push(item);
         });
         record.set('filterPanelItems', historyItems);
      },

      getFavoriteDialogRecord: function(self, item, historyId) {
         let editItem = item.get('data');
         let items;
         if (editItem) {
            items = item.get('data').get('filterPanelItems');
         } else {
            let history = HistoryUtils.getHistorySource(historyId).getDataObject(item.get('ObjectData'));
            items = history.items || history;
         }
         let captionsObject = _private.getCaptions(self._options.filterItems);
         items = factory(items).map((historyItem) => {
            historyItem.editable = historyItem.visibility;
            historyItem.caption = captionsObject[historyItem.id];
            return historyItem;
         }).value();
         return new Model({
            rawData: {
               filterPanelItems: items,
               toSaveFields: {},
               editedTextValue: '',
               globalParams: item.get('data') && item.get('data').get('globalParams') ? FILTER_STATUS.FOR_ALL : FILTER_STATUS.FOR_ME
            }
         });
      },

      updateFavoriteList: function(favoriteList, localStorage, globalStorage) {
         favoriteList.assign(localStorage.getHistory());
         favoriteList.prepend(globalStorage.getHistory());
      },

      updateFavorite: function(self, item, text, isFavorite) {
         let record = _private.getFavoriteDialogRecord(self, item, self._options.historyId);

         let popupOptions = {
            opener: self,
            templateOptions: {
               record: record,
               textValue: text,
               editMode: isFavorite ? 'isFavorite' : '',
               handlers: {
                  onDestroyModel: function() {
                     _private.removeRecord(self, item, record);
                     _private.updateFavoriteList(self._favoriteList, self._historyStorage, self._historyGlobalStorage);
                     self._children.dialogOpener.close();
                     self._notify('historyChanged');
                  },
                  onBeforeUpdateModel: function(event, record) {
                     let editItemData = item.get('data');
                     if (item.has('pinned')) {
                        HistoryUtils.getHistorySource(self._options.historyId).update(item, {
                           $_pinned: true
                        });
                     }

                     let deleteFields = record.get('toSaveFields');
                     if (deleteFields) {
                        factory(record.get('filterPanelItems')).each((item) => {
                           if (deleteFields[item.id] === false) {
                              item.textValue = '';
                              delete item.value;
                           }
                        });
                     }

                     _private.minimizeHistoryItems(record);

                     let linkText = record.get('editedTextValue') ||
                         editItemData && editItemData.get('editedTextValue')
                         || _private.getStringHistoryFromItems(record.get('filterPanelItems'), {});
                     record.set('linkText', linkText);

                     // convert items to old structure
                     record.set('filter', convertToFilterStructure(record.get('filterPanelItems')));

                     record.removeField('editedTextValue');
                     record.removeField('toSaveFields');
                     record.removeField('filterPanelItems');

                     _private.removeRecord(self, item, record);

                     if (record.get('globalParams')) {
                        self._historyGlobalStorage.prepend(record);
                     } else {
                        self._historyStorage.prepend(record);
                     }
                     _private.updateFavoriteList(self._favoriteList, self._historyStorage, self._historyGlobalStorage);
                     record.acceptChanges();
                     self._notify('historyChanged');
                  }
               }
            }
         };
         self._children.dialogOpener.open(popupOptions);
      },

      convertToItems: function(favoriteList) {
         factory(favoriteList).each((favoriteItem) => {
            favoriteItem.get('data').set('filterPanelItems', convertToSourceData(favoriteItem.get('data').get('filter')));
         });
      }
   };

   var HistoryList = BaseControl.extend({
      _template: template,
      _historySource: null,
      _isMaxHeight: true,
      _itemsText: null,
      _historyStorage: null,
      _historyGlobalStorage: null,
      _historyCount: Constants.MAX_HISTORY,

      _beforeMount: function(options) {
         if (options.items) {
            this._items = options.items.clone();
            this._itemsText = this._getText(options.items, options.filterItems, HistoryUtils.getHistorySource(options.historyId));
         }
         if (options.saveMode === 'favorite') {
            let self = this;
            let pDef = new ParallelDeferred();
            this._historyGlobalStorage = new HistoryStorage({
               historyId: options.historyId,
               isGlobalUserConfig: true
            });
            this._historyStorage = new HistoryStorage({
               historyId: options.historyId
            });
            pDef.push(this._historyStorage.getHistory(true));
            pDef.push(this._historyGlobalStorage.getHistory(true));
            return pDef.done().getResult().addCallback((items) => {
               self._favoriteList = items[0].clone();
               self._favoriteList.prepend(items[1]);
               _private.convertToItems(self._favoriteList);
               self._historyCount = Constants.MAX_HISTORY - self._favoriteList.getCount();
               return items;
            });
         }
      },

      _beforeUpdate: function(newOptions) {
         if (!isEqual(this._options.items, newOptions.items)) {
            this._items = newOptions.items.clone();
            this._itemsText = this._getText(newOptions.items, newOptions.filterItems, HistoryUtils.getHistorySource(newOptions.historyId));
         }
         if (newOptions.saveMode === 'favorite') {
            this._historyCount = Constants.MAX_HISTORY - this._favoriteList.getCount();
         }
      },

      _onPinClick: function(event, item) {
           HistoryUtils.getHistorySource(this._options.historyId).update(item, {
               $_pinned: !item.get('pinned')
           });
           this._notify('historyChanged');
      },

      _onFavoriteClick: function(event, item, text, isFavorite) {
         _private.updateFavorite(this, item, text, isFavorite);
      },

      _clickHandler: function(event, item, isFavorite) {
         let history;
         if (isFavorite) {
             history = item.get('data').get('filterPanelItems');
         } else {
             history = HistoryUtils.getHistorySource(this._options.historyId).getDataObject(item.get('ObjectData'));
         }
         this._notify('applyHistoryFilter', [history]);
      },

      _afterMount: function() {
         _private.onResize(this);
      },

      _afterUpdate: function() {
         _private.onResize(this);
      },

      _getText: function(items, filterItems, historySource) {
         const itemsText = {};
         // the resetValue is not stored in history, we take it from the current filter items
         const resetValues = _private.getResetValues(filterItems);

         factory(items).each((item, index) => {
            let text = '';
            const history = historySource.getDataObject(item.get('ObjectData'));

            if (history) {
               text = _private.getStringHistoryFromItems(history.items || history, resetValues);
            }
            itemsText[index] = text;
         });
         return itemsText;
      },

      _clickSeparatorHandler: function() {
         this._isMaxHeight = !this._isMaxHeight;
      }
   });

   HistoryList._private = _private;
   export = HistoryList;

