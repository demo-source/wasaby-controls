define('js!SBIS3.CONTROLS.LongOperationsRegistry',
   [
      'js!SBIS3.CORE.CompoundControl',
      'Core/RightsManager',
      'tmpl!SBIS3.CONTROLS.LongOperationsRegistry/resources/groupTpl',
      'tmpl!SBIS3.CONTROLS.LongOperationsRegistry/resources/emptyHTMLTpl',
      'tmpl!SBIS3.CONTROLS.LongOperationsRegistry',
      'css!SBIS3.CONTROLS.LongOperationsRegistry',
      'js!SBIS3.CONTROLS.Action.OpenEditDialog',
      'js!SBIS3.CONTROLS.Browser',
      'js!SBIS3.CONTROLS.SearchForm',
      'js!SBIS3.CONTROLS.FilterButton',
      'js!SBIS3.CONTROLS.LongOperationsList',
      'js!SBIS3.CONTROLS.LongOperationsFilter'
   ],

   function (CompoundControl, RightsManager, groupTpl, emptyHTMLTpl, dotTplFn) {
      'use strict';

      var FILTER_STATUSES = {
         'null': rk('В любом состоянии'),
         'running': rk('В процессе'),
         'suspended': rk('Приостановленные'),
         'ended': rk('Завершенные'),
         'success-ended': rk('Успешно'),
         'error-ended': rk('С ошибками')
      };

      /**
       * Класс для отображения реестра длительных операций
       * @class SBIS3.CONTROLS.LongOperationsRegistry
       * @extends SBIS3.CORE.CompoundControl
       *
       * @author Спирин Виктор Алексеевич
       *
       */
      var LongOperationsRegistry = CompoundControl.extend(/** @lends SBIS3.CONTROLS.LongOperationsRegistry.prototype */{
         _dotTplFn: dotTplFn,

         $protected: {
            _options: {
               className: '',
               userId: null,
               useGroupByEasyGroup: true
            },

            _longOpList: null,
            _previousGroupBy: null
         },

         $constructor: function () {
            var context = this.getLinkedContext();
            context.setValue('filter', {status:null, period:null, duration:null});
            if ('userId' in this._options) {
               context.setValue('filter/UserId', this._options.userId);
            }
         },

         init: function () {
            //###require('Core/ContextBinder').setDebugMode(true);
            LongOperationsRegistry.superclass.init.call(this);

            var self = this;
            this._longOpList = this.getChildControlByName('operationList');
            var view = this._longOpList.getView();

            view.setGroupBy({
               field: 'status',
               contentTemplate: groupTpl
            });

            this._bindEvents();
            this._longOpList.reload();
         },

         _modifyOptions: function () {
            var options = LongOperationsRegistry.superclass._modifyOptions.apply(this, arguments);
            options.hideStaffFilter = !!options.userId || !(RightsManager.getRights(['Long_requests_config'])['Long_requests_config'] & RightsManager.ADMIN_MASK);
            return options;
         },

         _bindEvents: function () {
            var self = this;
            var longOperationsBrowser = this.getChildControlByName('longOperationsBrowser');
            var view = this._longOpList.getView();//###longOperationsBrowser.getChildControlByName('browserView')

            /*var search = self.getChildControlByName('browserSearch');
            this.subscribeTo(search, 'onSearch', function (evtName, text, force) {
               if (!force) {
                  search._hideLoadingIndicator();
               }
            });*/

            //Открываем ссылку, если она есть, иначе открываем журнал выполнения операции
            this.subscribeTo(longOperationsBrowser, 'onEdit', function (e, meta) {
               self._longOpList.applyResultAction(meta.item);
            });

            this.subscribeTo(view, 'onDataLoad'/*'onItemsReady'*/, function (evtName, recordset) {
               self._previousGroupBy = null;
               var status = self._longOpList.getLinkedContext().getValue('filter/status');
               view.setEmptyHTML(emptyHTMLTpl({title:FILTER_STATUSES[status === undefined ? null : status]}));
            });
         }
      });

      return LongOperationsRegistry;
   }
);
