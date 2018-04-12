/**
 * Исполняемое действие "Настройщик импорта"
 *
 * @public
 * @class SBIS3.CONTROLS/ImportCustomizer/Action
 * @extends SBIS3.CONTROLS/Action
 */
define('SBIS3.CONTROLS/ImportCustomizer/Action',
   [
      'Core/core-merge',
      'Core/Deferred',
      'Lib/Control/FloatArea/FloatArea',
      'SBIS3.CONTROLS/Action',
      'SBIS3.CONTROLS/ImportCustomizer/Area',
      'SBIS3.CONTROLS/ImportCustomizer/RemoteCall'
   ],

   function (cMerge, Deferred, FloatArea, Action, Area, RemoteCall) {
      'use strict';

      var ImportCustomizerAction = Action.extend([], /**@lends SBIS3.CONTROLS/ImportCustomizer/Action.prototype*/ {

         /**
          * @typedef {object} ImportRemoteCall Тип, содержащий информацию для вызова удалённого сервиса для получения данных ввода или отправки данных вывода. Соответствует вспомогательному классу {@link SBIS3.CONTROLS/ImportCustomizer/RemoteCall}
          * @property {string} endpoint Сервис, метод которого будет вызван
          * @property {string} method Имя вызываемого метода
          * @property {string} [idProperty] Имя свойства, в котором находится идентификатор (опционально, если вызову это не потребуется)
          * @property {object} [args] Аргументы вызываемого метода (опционально)
          * @property {function(object):object} [argsFilter] Фильтр аргументов (опционально)
          * @property {function(object):object} [resultFilter] Фильтр результатов (опционально)
          */

         /**
          * @typedef {object} ImportFile Тип, содержащий информацию об импортируемом файле
          * @property {string} name Отображаемое имя файла
          * @property {string} url Урл для скачивания файла
          * @property {string} uuid Идентификатор файла в системе хранения
          */

         /**
          * @typedef {object} ImportParser Тип, содержащий информацию о провайдере парсинга импортируемых данных
          * @property {string} [name] Имя(идентификатор) парсера (опционально, если парсер является частью набора парсеров, представленного в виде объекта, где ключами являются таките имена(идентификаторы) парсеров)
          * @property {string} title Отображаемое имя парсера
          * @property {string} [component] Класс компонента для настройки парсера (опционально)
          * @property {object} [args] Набор специфичных для данного парсера параметров (опционально)
          */

         /**
          * @typedef {object} ImportSheet Тип, содержащий информацию об области импортируемых данных (например, лист excel)
          * @property {string} name Отображаемое наименование области данных
          * @property {Array<Array<string>>} sampleRows Образец данных в области, массив массивов равной длины
          * @property {string} [parser] Провайдер парсинга импортируемых данных (опционально)
          * @property {object} [parserConfig] Параметры провайдера парсинга импортируемых данных. Определяется видом парсера (опционально)
          * @property {number} [skippedRows] Количество пропускаемых строк в начале (опционально)
          * @property {string} [separator] Символы-разделители (опционально)
          * @property {Array<ImportColumnBinding>} [columns] Список привязки колонок импортируемых данных к полям базы данных (опционально)
          * @property {number} [index] Индекс в массиве (опционально)
          */

         /**
          * @typedef {object} ImportColumnBinding Тип, содержащий информацию о привязке колонки импортируемых данных к полю базы данных
          * @property {number} index Индекс колонки
          * @property {string} field Имя поля
          */

         /**
          * @typedef {object} ImportTargetFields Тип, описывающий целевые поля для привязки импортируемых данных
          * @property {Array<object>|WS.Data/Collection/RecordSet} items Список объектов, представляющих данные об одном поле. Каждый из них должен
          *                            содержать идентификатор поля, отображаемое наименование поля и идентификатор родителя, если необходимо. Имена
          *                            свойств задаются явно в этом же определинии типе
          * @property {string} [idProperty] Имя свойства, содержащего идентификатор (опционально, если items представлен рекордсетом)
          * @property {string} displayProperty Имя свойства, содержащего отображаемое наименование
          * @property {string} [parentProperty] Имя свойства, содержащего идентификатор родителя (опционально)
          */

         /**
          * @typedef {object} ImportMapping Тип, содержащий информацию о настройке соответствий значений
          * @property {function(object|WS.Data/Entity/Record):ImportMapperItem} fieldFilter Фильтр полей, с помощью которого из общего списка полей {@link fields} отбираются нужные. Фильтр принимает объект поля и, если оно нужное, возвращает объект вида {@link ImportSimpleItem}. Упрощённый способ отбора предоставляется опцией {@link fieldProperty}
          * @property {string} fieldProperty Имя специального ключевого свойства, с помощью которого из общего списка полей {@link fields} отбираются нужные. Каждое нужное поле должно иметь свойство с таким именем. Более комплексный способ отбора предоставляется опцией {@link fieldFilter}
          * @property {object} variants Набор вариантов сопоставления
          * @property {object} accordances Перечень соответствий специальный ключ поля - идентификатор варианта
          */

         /**
          * @typedef {object} ImportSimpleItem Тип, содержащий информацию об элементе сопоставления
          * @property {string|number} id Идентификатор элемента
          * @property {string} title Название элемента
          */

         /**
          * @typedef {object} ImportValidator Тип, описывающий валидаторы результаттов редактирования
          * @property {function(object, function):(boolean|string)} validator Функция проверки. Принимает два аргумента. Первый - объект с проверяемыми данными. Второй - геттер опции по её имени. Геттер позволяет получить доступ к опциям, которые есть в настройщике импорта в момент валидации, но на момент задания валидатора ещё не были доступны (например, получены через обещание или через {@link ImportRemoteCall}). Должна возвратить либо логическое значение, показывающее пройдена ли проверка, либо строку с сообщением об ошибке
          * @property {Array<*>} [params] Дополнительные аргументы функции проверки, будут добавлены после основных (опционально)
          * @property {string} [errorMessage] Сообщение об ошибке по умолчанию (опционально)
          * @property {boolean} [noFailOnError] Указывает на то, что если проверка не пройдена, это не является фатальным. В таком случае пользователю будет показан диалог с просьбой о подтверждении (опционально)
          */

         /**
          * @typedef {object} ImportResults Тип, содержащий информацию о результате редактирования
          * @property {string} dataType Тип импортируемых данных (excel и т.д.)
          * @property {ImportFile} file Информация о файле с импортируемыми данными
          * @property {Array<ImportSheet>} sheets Список объектов, представляющих имеющиеся области данных
          * @property {boolean} [sameSheetConfigs] Обрабатываются ли все области данных одинаково (опционально)
          * @property {object} [mappingAccordances] Перечень соответствий специальный ключ поля - идентификатор варианта (опционально, когда применимо)
          * @property {*} [*] Базовые параметры импортирования (опционально)
          */

         //_dotTplFn: null,
         $protected: {
            _options: {
               /**
                * @cfg {object<ImportParser>} Список доступных провайдеров парсинга импортируемых данных
                */
               parsers: {
                  // TODO: Обдумать добавление поля applicable:Array<string> для указания типов данных
                  'InColumsHierarchyParser': {title:rk('в отдельной колонке', 'НастройщикИмпорта'), component:'SBIS3.CONTROLS/ImportCustomizer/ProviderArgs/View', order:10},
                  'InLineGroupsHierarchyParser': {title:rk('в группировке строк', 'НастройщикИмпорта'), order:20},
                  'InSeparateLineHierarchyParser': {title:rk('в отдельной строке', 'НастройщикИмпорта'), order:30}
               },
               /**
                * @cfg {Array<ImportValidator>} Список валидаторов результатов редактирования
                */
               validators: [
                  {
                     validator: function (data, optionGetter) { return data.dataType === 'cml' || data.sheets.every(function (sheet) { return !!sheet.columns.length; }); },
                     errorMessage: rk('Не установлено соответсвие между колонками и полями', 'НастройщикИмпорта')
                  }
               ]
            },
            _result: null,
            _resultHandler: null
         },

         /**
          * Открыть настройщик импорта. Возвращает обещание, которое будет разрешено после завершения редактирования пользователем. В случае, если
          * пользователь после редактирования нажал кнопку применения результата редактирования, то обещание будет разрешено результатом
          * редактирования. Если же пользователь просто закрыл настройщик кнопкой "Закрыть", то обещание будет разрешено значением null.
          *
          * @public
          * @param {object} options Входные аргументы("мета-данные") настройщика импорта:
          * @param {string} options.dataType Тип импортируемых данных (excel и т.д.)
          * @param {ImportFile} options.file Информация о файле с импортируемыми данными
          * @param {string} [options.baseParamsComponent] Класс компонента для настройки параметров импортирования (опционально)
          * @param {object} [options.baseParams] Опции компонента для настройки параметров импортирования (опционально)
          * @param {object<ImportParser>} options.parsers Список доступных провайдеров парсинга импортируемых данных
          * @param {ImportTargetFields|Core/Deferred<ImportTargetFields>|ImportRemoteCall} options.fields Полный список полей, к которым должны быть привязаны импортируемые данные. Можкт быть как задано явно, так и указано в виде обещания(Deferred) или вызова метода удалённого сервиса
          * @param {Array<ImportSheet>} options.sheets Список объектов, представляющих имеющиеся области данных
          * @param {number} [options.sheetIndex] Индекс выбранной области данных (опционально)
          * @param {boolean} [options.sameSheetConfigs] Обрабатываются ли все области данных одинаково (опционально)
          * @param {Array<ImportValidator>} options.validators Список валидаторов результатов редактирования
          * @param {ImportRemoteCall} [options.inputCall] Информация для вызова метода удалённого сервиса для получения данных ввода (опционально)
          * @param {ImportRemoteCall} [options.outputCall] Информация для вызова метода удалённого сервиса для отправки данных вывода (опционально)
          * @return {Deferred<ImportResults>}
          */
         execute: function (options) {
            return ImportCustomizerAction.superclass.execute.apply(this, arguments);
         },

         /**
          * Метод, выполняющий основное действие
          * @protected
          * @param {object} options Входные аргументы("мета-данные") настройщика импорта (согласно описанию в методе {@link execute})
          */
         _doExecute: function (options) {
            if (!options || typeof options !== 'object') {
               throw new Error('No arguments');
            }
            if (this._result) {
               return Deferred.fail('Allready open');
            }
            var inputCall = options.inputCall;
            if (inputCall) {
               inputCall = new RemoteCall(inputCall);
            }
            var outputCall = options.outputCall;
            if (outputCall) {
               outputCall = new RemoteCall(outputCall);
            }
            var opts = inputCall || outputCall ? Object.keys(options).reduce(function (r, v) { if (v !== 'inputCall' && v !== 'outputCall') { r[v] = options[v]; }; return r; }, {}) : options;
            this._result = new Deferred();
            if (inputCall) {
               inputCall.call(opts).addCallbacks(
                  function (data) {
                     this._open(cMerge(opts, data));
                  }.bind(this),
                  this._completeWithError.bind(this, true, rk('При анализе файла поизошла ошибка', 'НастройщикИмпорта'))
               );
            }
            else {
               this._open(opts);
            }
            if (outputCall) {
               this._resultHandler = outputCall.call.bind(outputCall);
            }
            return this._result;
         },

         /**
          * Открыть область редактирования настройщика импорта
          *
          * @protected
          * @param {object} options Входные аргументы("мета-данные") настройщика импорта (согласно описанию в методе {@link execute})
          */
         _open: function (options) {
            // TODO: Учесть возможность задания части аргумента options декларативно через this._options
            var dataType = options.dataType;
            // Если есть свойство "dataType"
            if (dataType) {
               // оно должно быть строкой
               if (typeof dataType !== 'string') {
                  throw new Error('Wrong dataType');
               }
               // и входить в число поддерживаемых
               if (Area.DATA_TYPES.indexOf(dataType) === -1) {
                  var err = new Error(rk('Тип данных в этом файле не поддерживается', 'НастройщикИмпорта'));
                  err.name = 'NotSupportedDataType';
                  this._completeWithError(true, err);
                  return;
               }
            }
            var file = options.file;
            // Должно быть свойство "file"
            if (!file) {
               throw new Error('File required');
            }
            // И свойство "file" должно быть {@link ImportFile}
            if (typeof file !== 'object' ||
               !(file.name && typeof file.name === 'string') ||
               !(file.url && typeof file.url === 'string') ||
               !(file.uuid && typeof file.uuid === 'string')) {
               throw new Error('Wrong file');
            }
            var baseParamsComponent = options.baseParamsComponent;
            // Если есть свойство "baseParamsComponent" - оно должно быть строкой
            if (baseParamsComponent && typeof baseParamsComponent !== 'string') {
               throw new Error('Wrong baseParamsComponent');
            }
            var baseParamsOptions = options.baseParams;
            // Если есть свойство "baseParams" - оно должно быть объектом
            if (baseParamsOptions && typeof baseParamsOptions !== 'object') {
               throw new Error('Wrong baseParams');
            }
            var parsers = options.parsers;
            // Если есть свойство "parsers" - то оно должно быть объектом
            if (parsers && typeof parsers !== 'object') {
               throw new Error('Wrong parsers');
            }
            var fields = options.fields;
            // Должно быть свойство "fields" и быть объектом
            if (!fields || typeof fields !== 'object') {
               throw new Error('Wrong fields');
            }
            // TODO: Обдумать возможность выделения из fields массива hierarchy (с флагом joinHierarchy и последующим слиянием для нужного парсера)
            var isExcel = dataType === Area.DATA_TYPE_EXCEL;
            var isDBF = dataType === Area.DATA_TYPE_DBF;
            var isCML = dataType === Area.DATA_TYPE_CML;
            var needSheets = isExcel || isDBF;
            var sheets = options.sheets;
            if (needSheets) {
               // Для типа данных EXCEL должно быть свойство "sheets" и быть не пустым массивом
               if (!sheets || !Array.isArray(sheets) || !sheets.length) {
                  throw new Error('Sheets required');
               }
               // И каждый элемент массива должен быть {@link ImportSheet}
               if (!sheets.every(function (v) { return (
                     typeof v === 'object' &&
                     (v.name && typeof v.name === 'string') &&
                     (v.sampleRows && Array.isArray(v.sampleRows) && v.sampleRows.length && v.sampleRows.every(function (v2) { return v2 && Array.isArray(v2) && v2.length && v2.length === v.sampleRows[0].length; }))
                  ); })) {
                  throw new Error('Wrong sheets');
               }
            }
            var sheetIndex = options.sheetIndex;
            var sameSheetConfigs = options.sameSheetConfigs;
            if (needSheets) {
               // Если есть свойство "sheetIndex", то оно должно быть числом
               if (sheetIndex !=/*Не !==*/ null && typeof sheetIndex !== 'number') {
                  throw new Error('Wrong sheetIndex');
               }
               if (sameSheetConfigs) {
                  sheetIndex = -1;
               }
            }
            var mapping = options.mapping;
            // Если есть свойство "mapping", то оно должно быть {link ImportMapping}
            if (mapping && (typeof mapping !== 'object' ||
                  !(!mapping.fieldFilter || typeof mapping.fieldFilter === 'function') ||
                  !(!mapping.fieldProperty || typeof mapping.fieldProperty === 'string') ||
                  !(mapping.fieldFilter || mapping.fieldProperty) ||
                  !(!mapping.variants || typeof mapping.variants === 'object') ||
                  !(!mapping.accordances || typeof mapping.accordances === 'object')
               )) {
               throw new Error('Wrong mapping');
            }
            var validators = options.validators;
            // Если есть свойство "validators", то оно должно быть массивом
            if (validators && !Array.isArray(validators)) {
               throw new Error('Wrong validators');
            }
            var defaults = this._options;
            if (parsers) {
               // Поскольку уже есть набор парсеров по-умолчанию, то в объекте parsers могут содержаться только поправки, значит нужно слить их,
               // прежде чем проверять
               parsers = cMerge(cMerge({}, defaults.parsers), parsers);
               for (var name in parsers) {
                  // Каждый элемент набора parsers должно быть {@link ImportParser}
                  var v = parsers[name];
                  if (!(name &&
                        (typeof v === 'object') &&
                        (v.title && typeof v.title === 'string') &&
                        (!v.component || typeof v.component === 'string') &&
                        (!v.args || typeof v.args === 'object')
                     )) {
                     throw new Error('Wrong parsers items');
                  }
               }
            }
            if (validators) {
               // Поскольку уже есть набор валидаторов по-умолчанию, то нужно слить их, прежде чем проверять
               validators = defaults.validators.concat(validators);
               // И каждый элемент массива должен быть {@link ImportValidator}
               if (!validators.every(function (v) { return (
                     typeof v === 'object' &&
                     (v.validator && typeof v.validator === 'function') &&
                     (!v.params || Array.isArray(params)) &&
                     (!v.errorMessage || typeof v.errorMessage === 'string') &&
                     (!v.noFailOnError || typeof v.noFailOnError === 'boolean')
                  ); })) {
                  throw new Error('Wrong validators items');
               }
            }
            if (!(fields instanceof Deferred)) {
               // Проверим, имеет ли fields тип ImportRemoteCall
               var fieldsCall;
               try {
                  fieldsCall = new RemoteCall(fields);
               }
               catch (ex) {}
               if (fieldsCall) {
                  // Если да, то вызвать метод удалённого сервиса для получения списка полей
                  fields = fieldsCall.call(options);
               }
               /*else {
                  // иначе это должен быть тип ImportTargetFields, он будет проверен позже, в Area
               }*/
            }
            var componentOptions = {
               dialogMode: true,
               title: options.title,
               applyButtonTitle: options.applyButtonTitle,
               allSheetsTitle: options.allSheetsTitle,
               bindingColumnCaption: options.bindingColumnCaption,
               bindingColumnTitle: options.bindingColumnTitle,
               dataType: dataType,
               file: file,
               baseParams: baseParamsOptions,
               parsers: parsers || defaults.parsers,
               fields: fields,
               mapping: mapping,
               validators: validators || defaults.validators,
               handlers: {
                  onComplete: this._onAreaComplete.bind(this),
                  onFatalError: this._onAreaError.bind(this)
               }
            };
            if (baseParamsComponent) {
               componentOptions.baseParamsComponent = baseParamsComponent;
            }
            if (needSheets) {
               componentOptions.sheets = sheets;
               componentOptions.sheetIndex = sheetIndex;
               componentOptions.sameSheetConfigs = sameSheetConfigs;

            }
            this._areaContainer = new FloatArea({
               opener: this,
               direction: 'left',
               animation: 'slide',
               isStack: true,
               autoCloseOnHide: true,
               //parent: this,
               template: 'SBIS3.CONTROLS/ImportCustomizer/Area',
               className: 'ws-float-area__block-layout controls-ImportCustomizer__area',
               closeByExternalClick: true,
               closeButton: true,
               componentOptions: componentOptions,
               handlers: {
                  onClose: this._onAreaClose.bind(this)
               }
            });
            this._notify('onSizeChange');
            this.subscribeOnceTo(this._areaContainer, 'onAfterClose', this._notify.bind(this, 'onSizeChange'));
            //this._notify('onOpen');
         },

         /**
          * Встроенный обработчик ошибок, возникших в результате выполнения Deferred-a, возвращённого методом  _doExecute
          * @protected
          * @param {Error} error Ошибка
          * @param {object} options Входные аргументы("мета-данные") настройщика импорта (согласно описанию в методе {@link execute})
          */
         /*_handleError: function (err, options) {
         },*/

         /*
          * Обработчик события "onComplete"
          *
          * @protected
          * @param {Core/EventObject} evtName Дескриптор события
          * @param {object} data Данные события
          */
         _onAreaComplete: function (evtName, data) {
            this._complete(true, data);
         },

         /*
          * Обработчик события "onFatalError"
          *
          * @protected
          * @param {Core/EventObject} evtName Дескриптор события
          * @param {boolean} withAlert Показать пользователю предупреждение об ошибке
          * @param {Error|string} err Ошибка
          */
         _onAreaError: function (evtName, withAlert, err) {
            this._completeWithError(withAlert, err);
         },

         /*
          * Обработчик события "onClose"
          *
          * @protected
          * @param {Core/EventObject} evtName Дескриптор события
          */
         _onAreaClose: function (evtName) {
            if (this._areaContainer) {
               this._areaContainer.destroy();
               this._areaContainer = null;
            }
            var result = this._result;
            this._result = null;
            this._resultHandler = null;
            if (result) {
               result.callback(null);
            }
         },

         /*
          * Завершить работу и вернуть результат
          *
          * @protected
          * @param {object} isSuccess Завершение является успешным, не ошибочным
          * @param {object} outcome Результат
          */
         _complete: function (isSuccess, outcome) {
            var result = this._result;
            var resultHandler = isSuccess ? this._resultHandler : undefined;
            this._result = null;
            this._resultHandler = null;
            if (this._areaContainer) {
               this._areaContainer.close();
            }
            if (isSuccess) {
               if (resultHandler) {
                  result.dependOn(
                     resultHandler(outcome)
                        .addErrback(function (err) { return rk('При отправке данных поизошла ошибка', 'НастройщикИмпорта'); })
                  );
               }
               else {
                  result.callback(outcome);
               }
            }
            else {
               result.errback(outcome);
            }
         },

         /*
          * Завершить работу при возникновении ошибки
          *
          * @protected
          * @param {boolean} withAlert Показать пользователю предупреждение об ошибке
          * @param {Error|string} err Ошибка
          */
         _completeWithError: function (withAlert, err) {
            if (withAlert) {
               Area.showMessage(
                  'error',
                  rk('Ошибка', 'НастройщикИмпорта'),
                  ((err && err.message ? err.message : err) || rk('При получении данных поизошла неизвестная ошибка', 'НастройщикИмпорта')) + '\n' +
                     rk('Настройка импорта будет прервана', 'НастройщикИмпорта')
               )
                  .addCallback(this._complete.bind(this, false, err));
            }
            else {
               this._complete(false, err);
            }
         },

         /**
          * Отдать подписчикам событие и вернуть результат обработки, если есть. Если нет - вернуть результат редактирования
          * @protected
          * @param {object} options Входные аргументы("мета-данные") настройщика импорта (согласно описанию в методе {@link execute})
          * @param {ImportResults} results Результат редактирования
          * @return {object|*}
          */
         _notifyOnExecuted: function (options, results) {
            return this._notify(this, 'onExecuted', options, results) || results;
         }
      });



      return ImportCustomizerAction;
   }
);
