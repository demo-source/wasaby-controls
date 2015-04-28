define('js!SBIS3.CONTROLS.DSMixin', [
   'js!SBIS3.CONTROLS.StaticSource',
   'js!SBIS3.CONTROLS.ArrayStrategy',
   'js!SBIS3.CORE.MarkupTransformer'
], function (StaticSource, ArrayStrategy, MarkupTransformer) {

   /**
    * Миксин, задающий любому контролу поведение работы с набором однотипных элементов.
    * @mixin SBIS3.CONTROLS.DSMixin
    * @public
    */

   var setDataSourceCB = function () {
      this.reload();
   };

   var DSMixin = /**@lends SBIS3.CONTROLS.DSMixin.prototype  */{
      $protected: {
         _itemsInstances: {},
         _filter: undefined,
         _sorting: undefined,
         _offset: 0,
         _limit: undefined,
         _dataSource: undefined,
         _setDataSourceCB: null, //чтобы подписки отрабатывали всегда
         _dataSet: null,
         _dotItemTpl: null,
         _options: {
            /**
             * @cfg {String} Поле элемента коллекции, которое является ключом
             * @example
             * <pre>
             *     <option name="keyField">Идентификатор</option>
             * </pre>
             * @see items
             */
            keyField: null,
            items: undefined,
            /**
             * @cfg {DataSource} Набор исходных данных по которому строится отображение
             */
            dataSource: undefined,
            pageSize: null
         },
         _loader: null
      },

      $constructor: function () {
         this._publish('onDrawItems');
         //Для совместимости пока делаем Array

         if (this._options.dataSource) {
            this._dataSource = this._options.dataSource;
         }
         else {
            var items;
            if (this._options.items) {
               if (this._options.items instanceof Array) {
                  items = this._options.items;
               }
               else {
                  throw new Error('Array expected');
               }
            }
            else {
               items = [];
            }
            var
               item = items[0],
               keyField;
            if (this._options.keyField) {
               keyField = this._options.keyField;
            }
            else {
               if (item && Object.prototype.toString.call(item) === '[object Object]') {
                  keyField = Object.keys(item)[0];
               }
            }
            this._dataSource = new StaticSource({
               data: items,
               strategy: new ArrayStrategy(),
               keyField: keyField
            });
         }


         this._setDataSourceCB = setDataSourceCB.bind(this);
         this._dataSource.subscribe('onDataSync', this._setDataSourceCB);
      },

      setDataSource: function (ds) {
         this._dataSource.unsubscribe('onDataSync', this._setDataSourceCB);
         this._dataSource = ds;
         this._dataSet = null;
         this.reload();
         this._dataSource.subscribe('onDataSync', this._setDataSourceCB);
      },

      reload: function (filter, sorting, offset, limit) {
         if (this._options.pageSize) {
            this._limit = this._options.pageSize;
         }
         var self = this;
         this._cancelLoading();
         this._filter = typeof(filter) != 'undefined' ? filter : this._filter;
         this._sorting = typeof(sorting) != 'undefined' ? sorting : this._sorting;
         this._offset = typeof(offset) != 'undefined' ? offset : this._offset;
         this._limit = typeof(limit) != 'undefined' ? limit : this._limit;
         this._loader = this._dataSource.query(this._filter, this._sorting, this._offset, this._limit).addCallback(function (dataSet) {
            self._loader = null;//Обнулили без проверки. И так знаем, что есть и загрузили
            //FixMe: перезаписываем dataSet
            self._dataSet = dataSet;
            self._dataLoadedCallback();
            self._redraw();
         });
      },
      //TODO Сделать публичным? вроде так всем захочется делать
      _isLoading: function () {
         return this._loader && !this._loader.isReady();
      },
      //TODO Сделать публичным? вроде так всем захочется делать
      /**
       * После использования нужно присвоить null переданному loader самостоятельно!
       * @param loader
       * @private
       */
      _cancelLoading: function () {
         if (this._isLoading()) {
            this._loader.cancel();
         }
         this._loader = null;
      },
      setItems: function (items) {
         var
            item = items[0],
            keyField;

         if (this._options.keyField) {
            keyField = this._options.keyField;
         }
         else {
            if (item && Object.prototype.toString.call(item) === '[object Object]') {
               keyField = Object.keys(item)[0];
            }
         }
         this._dataSource = new StaticSource({
            data: items,
            strategy: new ArrayStrategy(),
            keyField: keyField
         });
         this.reload();
         //TODO совместимость
         if (typeof(window) != 'undefined') {
            console['log']('Метод setItems устарел. Он прекратит работу в версии 3.7.2');
         }
      },

      _drawItemsCallback: function () {
         /*Method must be implemented*/
      },

      _redraw: function () {
         this._clearItems();
         var records = [];

         this._dataSet.each(function (record) {
            records.push(record);
         });

         this._drawItems(records);
      },

      _drawItems: function (records, at) {
         var
            self = this,
            curAt = at;
         if (records && records.length > 0) {
            for (var i = 0; i < records.length; i++) {

               this._drawItem(records[i], curAt);

               if (curAt && curAt.at) {
                  curAt.at++;
               }
            }
            this.reviveComponents().addCallback(function () {
               self._notify('onDrawItems');
               self._drawItemsCallback();
            });
         }
      },


      _clearItems: function (container) {
         container = container || this._getItemsContainer();
         /*Удаляем компоненты-инстансы элементов*/
         if (!Object.isEmpty(this._itemsInstances)) {
            for (var i in this._itemsInstances) {
               if (this._itemsInstances.hasOwnProperty(i)) {
                  this._itemsInstances[i].destroy();
               }
            }
         }
         this._itemsInstances = {};

         var itemsContainers = $(".controls-ListView__item", container.get(0));
         /*Удаляем вложенные компоненты*/
         $('[data-component]', itemsContainers).each(function (i, item) {
            var inst = $(item).wsControl();
            inst.destroy();
         });

         /*Удаляем сами items*/
         itemsContainers.remove();
      },

      //метод определяющий в какой контейнер разместить определенный элемент
      _getTargetContainer: function () {
         //по стандарту все строки рисуются в itemsContainer
         return this._getItemsContainer();
      },

      //метод отдающий контейнер в котором надо отрисовывать элементы
      _getItemsContainer: function () {
         return this._container;
      },

      _drawItem: function (item, at) {
         var
            targetContainer,
            itemInstance;
         targetContainer = this._getTargetContainer(item);
         itemInstance = this._createItemInstance(item, targetContainer, at);
         this._addItemAttributes(itemInstance, item);
         this._appendItemTemplate(item, targetContainer, itemInstance, at);
      },

      _getItemTemplate: function () {
         throw new Error('Method _getItemTemplate() must be implemented');
      },

      _addItemAttributes: function (container, item) {
         container.attr('data-id', item.getKey()).addClass('controls-ListView__item');
      },

      _createItemInstance: function (item, targetContainer, at) {
         var
            buildedTpl,
            dotTemplate,
            itemTpl = this._getItemTemplate(item);

         if (typeof itemTpl == 'string') {
            dotTemplate = itemTpl;
         }
         else if (typeof itemTpl == 'function') {
            dotTemplate = itemTpl(item);
         }

         if (typeof dotTemplate == 'string') {
            buildedTpl = $(MarkupTransformer(doT.template(dotTemplate)(item)));
            return buildedTpl;
         }
         else {
            throw new Error('Шаблон должен быть строкой');
         }
      },

      _appendItemTemplate: function (item, targetContainer, itemBuildedTpl, at) {
         if (at && (typeof at.at !== 'undefined')) {
            var atContainer = $('.controls-ListView__item', this._getItemsContainer().get(0)).get(at.at);
            $(atContainer).before(itemBuildedTpl);
         }
         else {
            targetContainer.append(itemBuildedTpl);
         }
      },

      _fillItemInstances: function () {
         var childControls = this.getChildControls();
         for (var i = 0; i < childControls.length; i++) {
            if (childControls[i].getContainer().hasClass('controls-ListView__item')) {
               var id = childControls[i].getContainer().attr('data-id');
               this._itemsInstances[id] = childControls[i];
            }
         }

      },

      getItemsInstances: function () {
         if (Object.isEmpty(this._itemsInstances)) {
            this._fillItemInstances();
         }
         return this._itemsInstances;
      },

      getItemInstance: function (id) {
         var instances = this.getItemsInstances();
         return instances[id];
      },
      _hasNextPage: function (hasMore) {
         //n - приходит true, false || общее количество записей в списочном методе
         return typeof (hasMore) !== 'boolean' ? hasMore > this._offset : !!hasMore;
      },

      _dataLoadedCallback: function () {

      }


   };

   return DSMixin;

});