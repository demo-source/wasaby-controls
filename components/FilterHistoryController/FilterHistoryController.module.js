/**
 * Created by am.gerasimov on 07.12.2015.
 */
define('js!SBIS3.CONTROLS.FilterHistoryController',
    [
       'js!SBIS3.CONTROLS.Data.Collection.List'
    ],

    function(List) {

       'use strict';

       var MAX_FILTERS_AMOUNT = 10;
       var LAST_FILTER_NUMBER = 9;
       var EVENT_CHANNEL = $ws.single.EventBus.channel('FilterHistoryChannel');

       var FilterHistoryController = $ws.proto.Abstract.extend({
          $protected: {
             _options: {
                /**
                 * Специальный id по которому будет сохраняться история
                 * @cfg {String}
                 */
                historyId: undefined,
                /**
                 * Представление данных
                 */
                view: undefined,
                /**
                 * Кнопка фильтров
                 */
                filterButton: undefined
             },
             _history : undefined,              /* Объект с историей фильтров */
             _loadParamsDeferred: undefined,    /* Деферед загрузки истории */
             _saveParamsDeferred: undefined     /* Деферед сохранения истории */
          },

          $constructor: function() {
             var self = this,
                 fb = self._options.filterButton;

             /* Подпишемся на глобальный канал изменения истории,
                чтобы изменения сразу применялись ко всем реестрам, у которых один historyId */
             EVENT_CHANNEL.subscribe('onChangeHistory', function(e, id, newHistory, activeFilter, saveDeferred) {
                /* Если изменения произошло в истории с другим ID или история не изменилась, то ничего делать не будем */
                if (self._options.historyId !== id || self._history.equals(newHistory) || $ws.helpers.isEqualObject(self.getActiveFilter(), activeFilter)) return;

                /* Запишем новую историю */
                self._history.fill($ws.core.clone(newHistory.toArray()));
                self._saveParamsDeferred = saveDeferred;

                if(!activeFilter) {
                   fb._resetFilter();
                } else {
                   fb.setFilterStructure(activeFilter.filter);
                }
                self._updateFilterButtonHistoryView();
             });

             this.getHistory(true).addCallback(function(result) {
                self._history = new List({items: result});
                return result;
             });

             /* Если сбросили фильтр - сбросим активный */
             this._options.filterButton.subscribe('onResetFilter', function() {
                if(!self._options.filterButton.getLinkedContext().getValue('filterChanged')) {
                   self.clearActiveFilter();

                   if (!self._isNowSaving()) {
                      self.saveHistory();
                   }
                }
             });
          },

          _isNowSaving: function() {
             return this._saveParamsDeferred && !this._saveParamsDeferred.isReady()
          },

          _updateFilterButtonHistoryView: function() {
             var fbPicker = this._options.filterButton._picker;

             if(fbPicker) {
                fbPicker.getChildControlByName('filterHistory').updateHistoryViewItems();
             }
          },

          /**
           * Сохраняет объект с фильтром в историю
           * @param filterObject
           */
          saveToHistory: function(filterObject) {
             var equalFilter = $ws.helpers.find(this._history.toArray(), function(item) { return $ws.helpers.isEqualObject(item.filter, filterObject.filter); }),
                 activeFilter = this.getActiveFilter();

             /* Если есть активный фильтр - сбросим его */
             if(activeFilter) {
                activeFilter.isActiveFilter = false;
             }

             /* Не сохраняем в историю, если:
                1) Ещё не сохранился предыдущий фильтр,
                2) Такой фильтр уже есть в истории */
             if(this._isNowSaving() || equalFilter) {
                /* Если такой фильтр есть в истории, то надо его сделать активным */
                if(equalFilter && !equalFilter.isActiveFilter) {
                   equalFilter.isActiveFilter = true;
	                this.saveHistory()
                }
                return;
             }

             /* Если фильтров больше 10 - удалим последний */
             if (this._history.getCount() === MAX_FILTERS_AMOUNT) {
                this._history.removeAt(LAST_FILTER_NUMBER);
             }

             /* Добавим новый фильтр в начало набора */
             this._history.add({
                id: $ws.helpers.randomId(),
                linkText: filterObject.linkText,
	            viewFilter: this._options.view.getFilter(),
                filter: filterObject.filter,
                isActiveFilter: true,
                isMarked: false
             });

	          this.saveHistory();
          },

	       /**
	        * Сортирует и сохраняет историю в пользовательские параметры
	        * @param filterObject
	        */
          saveHistory: function() {
             this._sortHistory();
             this.saveToUserParams();
          },

	       /**
	        * Очищает текущий активный фильтр
	        */
          clearActiveFilter: function() {
             var item = this.getActiveFilter();

             if(item) {
                item.isActiveFilter = false;
             }
          },

          getActiveFilter: function() {
             return $ws.helpers.find(this._history.toArray(), function(item) {
                return item.isActiveFilter ? item : false;
             }, this, false);
          },

          /**
           * Возвращает фильтр из истории по ключу
           * @param {String} key
           * @private
           */
          getFilterFromHistory: function(key) {
             return this._findFilterByKey(key).filter;
          },

          /**
           * Ищет фильтр по ключу
           * @param {String} key
           * @private
           */
          _findFilterByKey: function(key) {
            var filtersArray = this._history.toArray();

             for(var i = 0, len = filtersArray.length; i < len; i++) {
                /* Нестрогое сравнение, потому что ключ может быть String || Number */
                if(filtersArray[i].id == key) {
                   return {
                      index: i,
                      filter: filtersArray[i]
                   };
                }
             }
          },

          /**
           * Сохраняет историю в пользовательские параметры
           * @private
           */
          saveToUserParams: function() {
             var self = this;

             if(!this._isNowSaving()) {
                this._saveParamsDeferred = new $ws.proto.Deferred();

                $ws.single.UserConfig.setParam(this._options.historyId, $ws.helpers.serializeURLData(this._history.toArray()), true).addCallback(function() {
                   self._saveParamsDeferred.callback();
                })
             }

             EVENT_CHANNEL.notify('onChangeHistory',
                 this._options.historyId,
                 this._history,
                 this.getActiveFilter(),
                 this._saveParamsDeferred
             );

             return this._saveParamsDeferred;

          },

          /**
           * Изменяет состояние флага отмеченности фильтра на противоположное
           * @param {String} key
           */
          toggleMarkFilter: function(key) {
             var item = this._history.at(this._findFilterByKey(key).index);
             item.isMarked = !item.isMarked;
             this.saveHistory()
          },

          _sortHistory: function() {
             /* Сортирует историю по флагу отмеченности и активности.
                Приоритет: отмеченные > активный > обычные. */
             this._history.toArray().sort(function(a, b) {
                if(a.isMarked && b.isMarked) {
                   return 0;
                } else if(a.isMarked) {
                   return -1;
                } else if(b.isMarked) {
                   return 1;
                } else if(a.isActiveFilter && b.isActiveFilter) {
                   return 0;
                } else if(a.isActiveFilter) {
                   return -1;
                } else if(b.isActiveFilter) {
                   return 1;
                }
             });
          },

          /**
           * Очищает историю
           */
          clearHistory: function() {
             this._history.fill();
             this.saveToUserParams();
          },

          /**
           * Возвращает деферред, результатом которого будет история
           * @param {Boolean} load Загружать ли историю
           * @returns {$ws.proto.Deferred|*}
           */
          getHistory: function(load) {
             var self = this,
                 nowLoading = this._loadParamsDeferred && !this._loadParamsDeferred.isReady();

             //TODO надо ли ??
             if(!$ws._const.userConfigSupport) {
                return new $ws.proto.Deferred().callback(this._history && this._history.toArray() || []);
             }

             if(!nowLoading) {
                this._loadParamsDeferred = new $ws.proto.Deferred();
                if(load) {
                   $ws.single.UserConfig.getParam(this._options.historyId).addCallback(function (result) {
                      self._loadParamsDeferred.callback(result && $ws.helpers.deserializeURLData(result) || []);
                   });
                } else {
                   this._loadParamsDeferred.callback(this._history && this._history.toArray() || []);
                }
             }

             return this._loadParamsDeferred;
          }
       });

       return FilterHistoryController;

    });