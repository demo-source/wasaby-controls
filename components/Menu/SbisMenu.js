define('SBIS3.CONTROLS/Menu/SbisMenu', [
    'SBIS3.CONTROLS/Menu/ContextMenu',
    'WS.Data/Entity/Model',
    'Core/core-clone',
    'SBIS3.CONTROLS/Menu/SBISHistoryController',
    'css!SBIS3.CONTROLS/Menu/SbisMenu/SbisMenu'
], function (ContextMenu, Model, coreClone, HistoryController) {

    'use strict';
    /**
     * Класс контрола "Меню с историей".
     *
     * <a href="http://axure.tensor.ru/standarts/v7/%D0%BC%D0%B5%D0%BD%D1%8E__%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F_01_.html#onloadvariable=0&name=0&CSUM=1">Стандарт</a>
     *
     * Контрол применяется в тех прикладных задачах, где пользователю нужно удобно переходить к часто используемому действию среди множества возможных.
     *
     * Кнопка "Меню с историей" состоит из блоков основного меню и истории. Блок истории отображается над основным блоком меню .
     *
     * <h2>Блок истории</h2>
     *
     * В блок истории входят следующие пункты меню:
     *
     * <ul>
     *    <li>
     *        <b>Последние действия пользователя</b>.<br/>
     *        К таким пунктам относятся последние выбранные пользователем, исключая часто используемые и закрепленные.<br/>
     *        Отображаются всегда, когда задана опция <a href="/docs/js/SBIS3/CONTROLS/Menu/SbisMenu/options/historyId/">historyId</a>.<br/>
     *        Единовременно может быть отображено не более 3 таких пунктов.
     *    </li>
     *    <li>
     *        <b>Популярные (часто используемые)</b>.<br/>
     *        Для каждого пользователя отображается собственный набор популярных пунктов меню.<br/>
     *        Оценка популярности формируется на основе количества раз, когда пункт был выбран.<br/>
     *        Собираемая статистика хранится в БД <a href="/doc/platform/developmentapl/middleware/input-history-service/">Сервиса истории выбора</a>.<br/>
     *        Популярные пункты меню сортируются в алфавитном порядке.<br/>
     *        Единовременно может быть отображено не более 7 пунктов меню.<br/>
     *        Отображение пунктов задаётся в опции <a href="/docs/js/SBIS3/CONTROLS/Menu/SbisMenu/options/frequent/">frequent</a>.
     *    </li>
     *    <li>
     *        <b>Закреплённые</b>.<br/>
     *        Для каждого пользователя отображается собственный набор закреплённых пунктов меню.<br/>
     *        Данные о таких пунктах хранятся в БД <a href="/doc/platform/developmentapl/middleware/input-history-service/">Сервиса истории выбора</a>.<br/>
     *        При закреплении ещё одного пункта он добавляется ниже ранее закреплённых пунктов.<br/>
     *        Пункты стилизованы в полужирном начертании.<br/>
     *        Количество таких пунктов не ограничено.<br/>
     *        Отображение пунктов задаётся в опции <a href="/docs/js/SBIS3/CONTROLS/Menu/SbisMenu/options/pinned/">pinned</a>.
     *        <br/><br/>
     *        Добавление пунктов в число закреплённых сначала происходит за счёт числа "популярных", а потом - "последних действий пользователя". Пример:
     *        <pre>
     *        10 пунктов = 7 популярных + 3 последних действий пользователя
     *        10 пунктов = 2 закрепленных + 5 популярных + 3 последних действий пользователя
     *        10 пунктов = 9 закрепленных + 1 последних действий пользователя
     *        более 10 пунктов = только закреплённые пункты меню
     *        </pre>
     *    </li>
     * </ul>
     *
     * @class SBIS3.CONTROLS/Menu/SbisMenu
     * @author Романов В.С.
     * @extends SBIS3.CONTROLS/Menu/ContextMenu
     * @control
     * @public
     * @category Buttons
     */

    var SbisMenu = ContextMenu.extend(/** @lends SBIS3.CONTROLS/Menu/SbisMenu.prototype */ {
        $protected: {
            _options: {
                /**
                 * @cfg {String} Идентификатор истории ввода.
                 * @remark
                 * Используется <a href="/doc/platform/developmentapl/middleware/input-history-service/">Сервисом истории выбора</a> для сохранения данных о выборе пользователя.
                 * Благодаря этой настройке в кнопке "Меню с историей" будут отображены последние выбранные пункты меню, количество которых единовременно не может быть более 3.
                 * Идентификатор должен быть уникальным в рамках всего приложения. Он должен описывать ту функциональную область, в которой применяется.
                 * Пример: ИсходящийПлатеж, КоррИсх, Веха, Смета, Проекта
                 */
                historyId: null,
                /**
                 * @cfg {Boolean} Отображать ли закреплённые пункты меню в блоке истории.
                 * @remark
                 * Для каждого пользователя отображается собственный набор закреплённых пунктов меню.
                 * Данные о таких пунктах хранятся в БД <a href="/doc/platform/developmentapl/middleware/input-history-service/">Сервиса истории выбора</a>.
                 * При закреплении ещё одного пункта он добавляется ниже ранее закреплённых пунктов.
                 * Пункты стилизованы в полужирном начертании.
                 * Количество таких пунктов не ограничено.
                 */
                pinned: false,
                /**
                 * @cfg {Boolean} Отображать ли популярные (часто выбираемые) пункты меню в блоке истории.
                 * @remark
                 * Для каждого пользователя отображается собственный набор популярных пунктов меню.
                 * Оценка популярности формируется на основе количества раз, когда пункт был выбран.
                 * Собираемая статистика хранится в БД <a href="/doc/platform/developmentapl/middleware/input-history-service/">Сервиса истории выбора</a>.
                 * Популярные пункты меню сортируются в алфавитном порядке.
                 * Единовременно может быть отображено не более 7 пунктов меню.
                 */
                frequent: false,
                additionalProperty: 'additional'
            },
            _historyDeferred: null,
            _needToRedrawHistory: false,
            _historyController: null
        },

        _modifyOptions: function (cfg) {
            var opts = SbisMenu.superclass._modifyOptions.apply(this, arguments);

            opts.className = cfg.pinned ? opts.className + ' controls-SbisMenu-padding-right' : opts.className;
            opts.additionalProperty = opts.additionalProperty ? opts.additionalProperty : 'additional';

            return opts;
        },

        show: function () {
            var self = this;
            if (!this._historyDeferred) {

                this._historyController = new HistoryController({
                    oldItems: coreClone(self._items),
                    historyId: this._options.historyId,
                    pinned: this._options.pinned,
                    frequent: this._options.frequent,
                    displayProperty: this._options.displayProperty,
                    additionalProperty: this._options.additionalProperty,
                    subContainers: this._subContainers,
                    parentProperty: this._options.parentProperty
                });

                this._historyController.initRecordSet();

                this._historyDeferred = this._historyController.getUnionIndexesList(self).addCallback(function (data) {
                    self._historyController.parseHistoryData(data); // считывает данные
                    self._historyController.prepareHistoryData(); // проставляет свойства в рекорд
                    self.setItems(self._historyController.prepareHistory()); // заполняем финальный рекорд со всеми записями
                    SbisMenu.superclass.show.apply(self, arguments);
                }).addErrback(function (error) {
                    self._historyController.prepareHistoryData(self);
                    self.setItems(self._historyController.prepareHistory());
                    SbisMenu.superclass.show.apply(self, arguments);
                });
            } else {
                if (this._historyDeferred.isReady()) {
                    if(this._needToRedrawHistory){
                        this.setItems(this._historyController.prepareHistory());
                        this._needToRedrawHistory = false;
                    }
                    SbisMenu.superclass.show.apply(self, arguments);
                }
            }
        },

        _getItemConfig: function (cfg, item) {
            cfg.pinned = this._options.pinned ? !!item.get('pinned') : undefined;
            cfg.historyItem = !!item.get('historyItem');
            cfg.groupSeparator = item.get('groupSeparator');

            return SbisMenu.superclass._getItemConfig.apply(this, arguments);
        },

        _itemActivatedHandler: function (id, event) {
            var targetClassName = event.target.className,
                origId = this._historyController.getOriginId(id),
                menuItem = this._items.getRecordById(id),
                newItem;
            if (!(this._isItemHasChild(id))) {
                if (targetClassName.indexOf('controls-Menu-item-pin') !== -1) { // кликнули по пину
                    this._historyController.togglePinnedItem(origId, menuItem); // public
                    this.setItems(this._historyController.prepareHistory());
                    return;
                }
                if (!this._subContainers[origId] && this._historyController.getRecent()) {
                    newItem = new Model({
                        rawData: menuItem.getRawData(),
                        adapter: menuItem.getAdapter()
                    });

                    this._historyController.addToRecent(origId, newItem);
                    this._needToRedrawHistory = true;
                }
                // стрелять нужно старым id
                this._historyController.addToHistory(origId);
            }
            SbisMenu.superclass._itemActivatedHandler.call(this, origId, event);
        }
    });

    return SbisMenu;

});