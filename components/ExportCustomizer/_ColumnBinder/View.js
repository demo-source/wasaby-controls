/**
 * Контрол "Привязки колонок файла к полям данных настройщика экспорта"
 *
 * @public
 * @class SBIS3.CONTROLS/ExportCustomizer/_ColumnBinder/View
 * @extends SBIS3.CONTROLS/CompoundControl
 */
define('SBIS3.CONTROLS/ExportCustomizer/_ColumnBinder/View',
   [
      'Core/CommandDispatcher',
      'Core/helpers/Object/isEqual',
      'SBIS3.CONTROLS/Browser/ColumnsEditor/Editor',
      'SBIS3.CONTROLS/CompoundControl',
      'WS.Data/Collection/RecordSet',
      'tmpl!SBIS3.CONTROLS/ExportCustomizer/_ColumnBinder/View',
      'css!SBIS3.CONTROLS/ExportCustomizer/_ColumnBinder/View'
   ],

   function (CommandDispatcher, cObjectIsEqual, ColumnsEditor, CompoundControl, RecordSet, dotTplFn) {
      'use strict';

      var View = CompoundControl.extend(/**@lends SBIS3.CONTROLS/ExportCustomizer/_ColumnBinder/View.prototype*/ {

         /**
          * @typedef {object} BrowserColumnInfo Тип, содержащий информацию о колонке браузера
          * @property {string} id Идентификатор колонки (как правило, имя поля в базе данных или БЛ)
          * @property {string} title Отображаемое название колонки
          * @property {string} [group] Идентификатор или название группы, к которой относится колонка (опционально)
          * @property {boolean} [fixed] Обязательная колонка (опционально)
          * @property {object} columnConfig Конфигурация колонки в формате, используемом компонентом SBIS3.CONTROLS:DataGridView
          */

         /**
          * @typedef {object} ExportColumnBinderResult Тип, описывающий возвращаемые настраиваемые значения компонента
          * @property {Array<string>} fieldIds Список привязки колонок в экспортируемом файле к полям данных
          */

         _dotTplFn: dotTplFn,
         $protected: {
            _options: {
               /**
                * @cfg {string} Заголовок компонента
                */
               title: null,//Определено в шаблоне
               /**
                * @cfg {string} Заголовок столбца колонок файла в таблице соответствия
                */
               columnsTitle: rk('Столбец', 'НастройщикЭкспорта'),
               /**
                * @cfg {string} Заголовок столбца полей данных в таблице соответствия
                */
               fieldsTitle: rk('Поле данных', 'НастройщикЭкспорта'),
               /**
                * @cfg {string} Отображаемый текст при пустом списке соответствий
                */
               emptyTitle: rk('Не задано', 'НастройщикЭкспорта'),
               /**
                * @cfg {Array<BrowserColumnInfo>|WS.Data/Collection/RecordSet<BrowserColumnInfo>} Список объектов с информацией о всех колонках в формате, используемом в браузере
                */
               allFields: null,
               /**
                * @cfg {Array<string>} Список привязки колонок в экспортируемом файле к полям данных
                */
               fieldIds: null,
               /**
                * @cfg {object} Список отображаемых названий групп полей (если используются идентификаторы групп)
                */
               fieldGroupTitles: null
            },
            // Контрол списка соответствий колонок файла и полей данных
            _grid: null,
            // Редактор колонок
            _columnsEditor: null
         },

         _modifyOptions: function () {
            var options = View.superclass._modifyOptions.apply(this, arguments);
            options._columns = [
               {field:'column', title:options.columnsTitle},
               {field:'field', title:options.fieldsTitle}
            ];
            options._rows = this._makeRows(options);
            options._rowActions = this._makeRowActions();
            return options;
         },

         /*$constructor: function () {
         },*/

         init: function () {
            //При клике по кнопке добавления колонок
            CommandDispatcher.declareCommand(this, 'addRows', this._onAdd.bind(this));
            View.superclass.init.apply(this, arguments);
            this._grid = this.getChildControlByName('controls-ExportCustomizer-ColumnBinder-View__grid');
            this._bindEvents();
         },

         _bindEvents: function () {
            //При клике по строке списка колонок
            this.subscribeTo(this._grid, 'onItemActivate', this._onEdit.bind(this));
         },

         /**
          * Приготовить строки списка колонок
          * @protected
          * @param {object} options Опции компонента
          * @return {Array<object>}
          */
         _makeRows: function (options) {
            var fieldIds = options.fieldIds;
            if (fieldIds && fieldIds.length) {
               var allFields = options.allFields;
               var isRecordSet = allFields instanceof RecordSet;
               return fieldIds.map(function (id, i) {
                     var field;
                     if (!isRecordSet) {
                        allFields.some(function (v) { if (v.id === id) { field = v; return true; } });
                     }
                     else {
                        var model = allFields.getRecordById(id);
                        if (model) {
                           field = model.getRawData();
                        }
                     }
                     if (!field) {
                        throw new Error('Unknown field: ' + id);
                     }
                     return {id:id, column:_toLetter(i), field:field.title};
                  });
            }
            else {
               return [{id:'', column:'A', field:emptyTitle}];
            }
         },

         /**
          * Приготовить список доступных действий для строки списка колонок
          * @protected
          * @return {Array<object>}
          */
         _makeRowActions: function () {
            var title = rk('Удалить', 'НастройщикЭкспорта');
            return [{
               name: 'delete',
               icon: 'sprite:icon-16 icon-Erase icon-error',
               caption: title,
               tooltip: title,
               isMainAction: true,
               onActivated: this._onDelete.bind(this)
            }];
         },

         /**
          * Открыть редактор колонок
          * @protected
          * @param {string} fieldId Идентификатор текущего поля
          * @return {Core/Deferred<Array<string>>}
          */
         _openColumnsEditor: function (fieldId) {
            if (!this._columnsEditor) {
               this._columnsEditor = new ColumnsEditor();
            }
            var options = this._options;
            //////////////////////////////////////////////////
            // Это временная затычка до тех пор, пока не реализована опция ignoreFixed в редакторе колонок
            // TODO: Убрать это
            options.allFields = new RecordSet({
               rawData: options.allFields.getRawData().map(function (v) { return {id:v.id, title:v.title, group:v.group, columnConfig:v.columnConfig}; }),
               idProperty: options.allFields.getIdProperty()
            });
            //////////////////////////////////////////////////
            return this._columnsEditor.open(
               {
                  columns: options.allFields,
                  selectedColumns: fieldId ? [fieldId] : []
               },
               {
                  title: fieldId ? rk('Выберите поле данных', 'НастройщикЭкспорта') : rk('Выбор полей данных', 'НастройщикЭкспорта'),
                  applyButtonTitle: rk('Выбрать', 'НастройщикЭкспорта'),
                  groupTitles: options.fieldGroupTitles,
                  preserveOrder: true,
                  ignoreFixed: true// TODO: Добавить в редактор колонок опцию ignoreFixed
               }
            ).addCallback(function (resultColumnsConfig) {
               return resultColumnsConfig ? resultColumnsConfig.selectedColumns : null;
            });
         },

         /**
          * Обработчик команды при клике по кнопке добавления колонок
          * @protected
          */
         _onAdd: function () {
            // Открыть редактор колонок
            this._openColumnsEditor().addCallback(function (fieldIds) {
               // И затем ...
               //^^^this._options.^^^ = ^^^;
               //^^^this.sendCommand('subviewChanged');
            });
         },

         /**
          * Обработчик события при клике по строке списка колонок
          * @protected
          * @param {Core/EventObject} evtName Дескриптор события
          * @param {object} data Информация о редактируемой строке (id, item)
          */
         _onEdit: function (evtName, data) {
            // Открыть редактор колонок
            this._openColumnsEditor(data.id).addCallback(function (fieldIds) {
               // И затем ...
               //^^^this._options.^^^ = ^^^;
               //^^^this.sendCommand('subviewChanged');
            });
         },

         /**
          * Обработчик события при удалении строки списка колонок
          * @protected
          * @param {Core/EventObject} evtName Дескриптор события
          * @param {string|number} id Идентификатор пункта списка колонок
          * @param {object} model Модель пункта списка колонок
          * @param {string} action Название действия
          */
         _onDelete: function (evtName, id, model/*, action*/) {
            //^^^this._options.^^^ = ^^^;
            //^^^this.sendCommand('subviewChanged');
         },

         /**
          * Установить указанные настраиваемые значения компонента
          *
          * @public
          * @param {object} values Набор из нескольких значений, которые необходимо изменить
          */
         setValues: function (values) {
            if (!values || typeof values !== 'object') {
               throw new Error('Object required');
            }
            var options = this._options;
            if ('fieldIds' in values) {
               var fieldIds = values.fieldIds;
               var has = fieldIds && fieldIds.length ? !cObjectIsEqual(fieldIds, options.fieldIds) : !!(options.fieldIds && options.fieldIds.length);
               if (has) {
                  options.fieldIds = fieldIds || [];
                  this._grid.setItems(this._makeRows(options));
               }
            }
         },

         /**
          * Получить все настраиваемые значения компонента
          *
          * @public
          * @return {ExportColumnBinderResult}
          */
         getValues: function () {
            return {
               fieldIds: this._options.fieldIds
            };
         }
      });



      // Private methods:

      /**
       * Создать буквенное обозначение для числа
       *
       * @private
       * @param {number} index Неотрицательное число
       * @return {string}
       */
      var _toLetter = function (index) {
         return '' + (index + 1);//^^^
      };



      return View;
   }
);
