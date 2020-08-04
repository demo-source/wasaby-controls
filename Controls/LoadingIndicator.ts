import {Control, TemplateFunction} from 'UI/Base';
import tmpl = require('wml!Controls/_LoadingIndicator/LoadingIndicator');
import randomId = require('Core/helpers/Number/randomId');
import {List} from 'Types/collection';
import ILoadingIndicator, {ILoadingIndicatorOptions} from 'Controls/_LoadingIndicator/interface/ILoadingIndicator';
import LoadingIndicatorOpener from 'Controls/_LoadingIndicator/LoadingIndicatorOpener';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';


/**
 * Контейнер для контента с возможностью отображения индикатора загрузки.
 * Может использоваться локально для покрытия собственного контента или глобально для покрытия всей страницы.
 * @remark
 * Контрол обрабатывает два события — showIndicator и hideIndicator.
 *
 * Событие showIndicator используется для отображения индикатора.
 * Это могут быть какие-либо запросы.
 * Запросы составляют стек, где последний обработанный запрос LoadingIndicator используется для отображения индикатора.
 * Индикатор пропадает, когда стек становится пустым.
 * Параметры события showIndicator идентичны аргументам метода {@link show}.
 *
 * Событие hideIndicator используется для удаления запроса отображения индикатора.
 * Параметры события hideIndicator идентичны аргументам метода {@link hide}.
 *
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_loadingIndicator.less">переменные тем оформления</a>
 *
 * @class Controls/LoadingIndicator
 * @extends Core/Control
 * @control
 * @implements Controls/_LoadingIndicator/interface/ILoadingIndicator
 * @author Красильников А.С.
 * @public
 * @category Container
 * @demo Controls-demo/LoadingIndicator/Overlay/Index
 */

/*
 * Container for content that can show loading indicator.
 * It can be local using for covering it's own content or global using for covering whole page.
 * @remark
 * LoadingIndicator is waiting 2 events: showIndicator and hideIndicator.
 *
 * showIndicator is using for request of indicator showing. It may be some requests.
 * Requests compose stack where last handled request is using by LoadingIndicator for indicator showing.
 * Indicator becomes invisible when stack will be empty.
 * showIndicator has 2 arguments: [config, waitPromise].
 * config is object having properties:
 *    -  id (String) - defines the unique id of showing request (By default use autogenerated id),
 *    -  isGlobal (Boolean) - global or not (If not setted, by default use value of similar control option)
 *    -  message (String) - message of indicator (If not setted, by default use value of similar control option)
 *    -  scroll (String) - add gradient of indicator's background (If not setted, by default use value of similar control option)
 *    -  small (String) - size of indicator (If not setted, by default use value of similar control option)
 *    -  overlay (String) - setting of indicator's overlay (If not setted, by default use value of similar control option)
 *    -  delay (Number) - timeout before indicator will be visible (If not setted, by default use value of similar control option)
 * waitPromise (Promise) - when this promise will be resolved, indicator hides (not necessary property)
 * showIndicator returns id value using as argument of hideIndicator.
 *
 * hideIndicator is using for remove request of indicator showing.
 * hideIndicator has 1 argument: [id].
 * id is Number type property. It needs for remove concrete request from stack of requests.
 *
 *
 *
 * @class Controls/LoadingIndicator
 * @extends Core/Control
 * @implements Controls/_LoadingIndicator/interface/ILoadingIndicator
 * @control
 * @author Красильников А.С.
 * @public
 * @category Container
 * @demo Controls-demo/LoadingIndicator/Overlay/Index
 */
let ManagerController;

class LoadingIndicator extends Control<ILoadingIndicatorOptions> implements ILoadingIndicator {
    protected _template: TemplateFunction = tmpl;

    protected _isOverlayVisible: boolean = false;
    protected _isMessageVisible: boolean = false;
    protected _stack: List<ILoadingIndicatorOptions>;
    protected _delay: number = 2000;
    protected _zIndex: number;
    protected _toggleOverlayTimerId: number;
    protected _overlayDiv: HTMLDivElement = null;
    protected _messageDiv: HTMLDivElement = null;

    protected isGlobal: boolean = true;
    protected message: string = '';
    protected scroll: string = '';
    protected small: string = '';
    protected theme: string = '';
    protected overlay: string = 'default';
    protected mods: Array<string> | string;
    protected delay: number;
    protected delayTimeout: number;

    protected _beforeMount(cfg: ILoadingIndicatorOptions): void {
        this.mods = [];
        this._stack = new List();
        this._updateProperties(cfg);
    }

    protected _afterMount(cfg: ILoadingIndicatorOptions): void {
        if (cfg.mainIndicator) {
            LoadingIndicatorOpener._setIndicator(this);
            // Вернул для индикаторов, вызванных из кода
            requirejs(['Controls/popup'], (popup) => {
                ManagerController = popup.Controller;
                ManagerController.setIndicator(this);
            });
        }

        // TODO Откатить DOM-решение или доказать невозмодность другого в задаче по ссылке ниже.
        // https://online.sbis.ru/opendoc.html?guid=2bd41176-8896-4a0a-a04d-a93b8a4c3a2d
        this._redrawOverlay();
    }

    protected _beforeUpdate(cfg: ILoadingIndicatorOptions): void {
        this._updateProperties(cfg);
        this._redrawOverlay();
    }

    _updateProperties(cfg: ILoadingIndicatorOptions): void {
        if (cfg.isGlobal !== undefined) {
            this.isGlobal = cfg.isGlobal;
        }
        if (cfg.message !== undefined) {
            this.message = cfg.message;
        }
        if (cfg.scroll !== undefined) {
            this.scroll = cfg.scroll;
        }
        if (cfg.small !== undefined) {
            this.small = cfg.small;
        }
        if (cfg.overlay !== undefined) {
            this.overlay = cfg.overlay;
        }
        if (cfg.theme !== undefined) {
            this.theme = cfg.theme;
        }
        if (cfg.mods !== undefined) {
            // todo сделать mods строкой всегда, или вообще удалить опцию
            if (Array.isArray(cfg.mods)) {
                this.mods = cfg.mods;
            } else if (typeof cfg.mods === 'string') {
                this.mods = [cfg.mods];
            }
        }
        this.delay = cfg.delay !== undefined ? cfg.delay : this._delay;

    }

    // Indicator is opened above existing popups.
    _updateZIndex(config: ILoadingIndicatorOptions): void {
        const popupItem = ManagerController && ManagerController.find((config || {}).popupId);
        const POPUP_BASE_ZINDEX = 10;
        if (popupItem) {
            this._zIndex = popupItem.currentZIndex;
        } else if (isNewEnvironment() && this._options.mainIndicator) {
            // TODO https://online.sbis.ru/opendoc.html?guid=ce175632-8ecc-4789-803a-4fef10906f5c
            this._zIndex = POPUP_BASE_ZINDEX - 1;
        } else {
            this._zIndex = null;
        }
    }

    _showHandler(event: SyntheticEvent<Event>, config: ILoadingIndicatorOptions, waitPromise: Promise<any>): string {
        event.stopPropagation();
        return this._show(config, waitPromise);
    }

    private _hideHandler(event: SyntheticEvent<Event>, id: string): void {
        event.stopPropagation();
        return this._hide(id);
    }

    /*
     * show indicator (bypassing requests of indicator showing stack)
     */
    /**
     * Отображает индикатор загрузки.
     * @function
     * @name Controls/LoadingIndicator#show
     * @param {Object} [config] Объект с параметрами. Если не задан, по умолчанию используется значение аналогичного параметра контрола.
     * @param {Boolean} [config.isGlobal=true] Определяет, показать индикатор над всей страницей или только над собственным контентом.
     * @param {String} [config.message=''] Текст сообщения индикатора.
     * @param {Scroll} [config.scroll=''] Добавляет градиент фону индикатора.
     * @param {Small} [config.small=''] Размер индикатора.
     * @param {Overlay} [config.overlay=default] Настройки оверлея индикатора.
     * @param {Number} [config.delay=2000] Задержка перед началом показа индикатора.
     * @param {Promise} [waitPromise] Promise, к которому привязывается отображение индикатора. Индикатор скроется после завершения Promise.
     * @returns {String} Возвращает id индикатора загрузки. Используется в методе {@link hide} для закрытия индикатора.
     * @see hide
     */
    show(config: ILoadingIndicatorOptions, waitPromise?: Promise<any>): string {
        return this._show({...config}, waitPromise);
    }

    private _show(config: ILoadingIndicatorOptions, waitPromise?: Promise<any>): string {
        const newCfg = this._prepareConfig(config, waitPromise);
        const isOpened = this._getItemIndex(newCfg.id) > -1;
        if (isOpened) {
            this._replaceItem(newCfg.id, newCfg);
            this._updateProperties(newCfg);
        } else {
            this._stack.add(newCfg);
            this._toggleIndicator(true, newCfg);
        }
        return newCfg.id;
    }

    /*
     * hide indicator (bypassing requests of indicator showing stack)
     */
    /**
     * Скрывает индикатор загрузки.
     * @function
     * @name Controls/LoadingIndicator#hide
     * @param {Number} id Идентификатор индикатора загрузки.
     * @see show
     */
    hide(id?: string): void {
        if (!id) {
            // Used public api. In this case, hide the indicator immediately.
            this._clearStack();
            this._toggleIndicator(false, {});
        } else {
            this._hide(id);
        }
    }

    private _hide(id: string): void {
        this._removeItem(id);
        if (this._stack.getCount()) {
            this._toggleIndicator(true, this._stack.at(this._stack.getCount() - 1), true);
        } else {
            this._toggleIndicator(false);
        }
    }

    private _clearStack(): void {
        this._stack.clear();
    }

    private _isOpened(config?: ILoadingIndicatorOptions): boolean {
        // config is not required parameter. If config object is empty we should always create new Indicator due to absence of ID field in config
        if (!config) {
            return false;
        }
        const index = this._getItemIndex(config.id);
        if (index < 0) {
            delete config.id;
        }
        return !!config.id;
    }

    private _waitPromiseHandler(config: ILoadingIndicatorOptions): void {
        if (this._isOpened(config)) {
            this._hide(config.id);
        }
    }

    private _prepareConfig(config: ILoadingIndicatorOptions, waitPromise: Promise<any>): ILoadingIndicatorOptions {
        if (typeof config !== 'object') {
            config = {
                message: config
            };
        }
        if (!config.hasOwnProperty('message')) {
            config.message = '';
        }
        if (!config.hasOwnProperty('overlay')) {
            config.overlay = 'default';
        }
        if (!config.id) {
            config.id = randomId();
        }
        if (!config.hasOwnProperty('delay')) {
            config.delay = this.delay;
        }

        if (!config.waitPromise && waitPromise) {
            config.waitPromise = waitPromise;
            config.waitPromise.then(this._waitPromiseHandler.bind(this, config));
            config.waitPromise.catch(this._waitPromiseHandler.bind(this, config));
        }
        return config;
    }

    private _removeItem(id: string): void {
        const index = this._getItemIndex(id);
        if (index > -1) {
            this._stack.removeAt(index);
        }
    }

    private _replaceItem(id: string, config: ILoadingIndicatorOptions): void {
        this._removeItem(id);
        this._stack.add(config);
    }

    private _getItemIndex(id: string): number {
        return this._stack.getIndexByValue('id', id);
    }

    private _getDelay(config: ILoadingIndicatorOptions): number {
        return typeof config.delay === 'number' ? config.delay : this.delay;
    }

    private _getOverlay(overlay: string): string {
        // if overlay is visible, but message don't visible, then overlay must be transparent.
        if (this._isOverlayVisible && !this._isMessageVisible) {
            return 'default';
        }
        return overlay;
    }

    private _toggleIndicator(visible?: boolean, config: ILoadingIndicatorOptions = {}, force?: boolean): void {
        const isGlobal = config.hasOwnProperty('isGlobal') ? config.isGlobal : this.isGlobal;
        clearTimeout(this.delayTimeout);
        this._updateZIndex(config);
        if (visible) {
            this._blockContent(true, config, isGlobal);
            if (force) {
                this._toggleIndicatorVisible(true, config);
                if (!isGlobal) {
                    this._forceUpdate();
                }
            } else {
                // if we have indicator in stack, then don't hide overlay
                this._toggleIndicatorVisible(this._stack.getCount() > 1 && this._isOverlayVisible, config);
                this.delayTimeout = setTimeout(() => {
                    const lastIndex = this._stack.getCount() - 1;
                    if (lastIndex > -1) {
                        this._toggleIndicatorVisible(true, this._stack.at(lastIndex));
                        this._forceUpdate();
                    }
                }, this._getDelay(config));
            }
        } else {
            const needForceUpdate: boolean = this._isOverlayVisible || this._isMessageVisible;
            // if we dont't have indicator in stack, then hide overlay
            if (this._stack.getCount() === 0) {
                this._toggleIndicatorVisible(false);
                this._blockContent(false, config, isGlobal);
                if (needForceUpdate) {
                    this._forceUpdate();
                }
            }
        }
    }

    private _blockContent(toggle, config, isGlobal): void {
        if (isGlobal) {
            // Защита на случай, если сделали быстро 2 вызова с разными параметрами isGlobal
            this._toggleOverlayAsync(false);
            this._toggleEvents(toggle);
        } else {
            // Защита на случай, если сделали быстро 2 вызова с разными параметрами isGlobal
            this._toggleEvents(false);
            this._toggleOverlayAsync(toggle, config);
        }
    }

    private _toggleOverlayAsync(toggle: boolean, config: ILoadingIndicatorOptions = {}): void {
        // контролы, которые при ховере показывают окно, теряют свой ховер при показе оверлея,
        // что влечет за собой вызов обработчиков на mouseout + визуально дергается ховер таргета.
        // Делаю небольшую задержку, если окно не имеет в себе асинхронного кода, то оно успеет показаться раньше
        // чем покажется оверлей. Актуально для инфобокса, превьюера и выпадающего списка.
        // Увеличил до 100мс, за меньшее время не во всех браузерах успевает отрсиоваться окно даже без асинхронных фаз
        this._clearOverlayTimerId();
        const delay = Math.min(this._getDelay(config), 100);
        this._toggleOverlayTimerId = setTimeout(() => {
            this._toggleOverlay(toggle, config);
        }, delay);
    }

    private _toggleEvents(toggle: boolean): void {
        const action = toggle ? 'addEventListener' : 'removeEventListener';
        const events = ['mousedown', 'mouseup', 'click', 'keydown', 'keyup'];
        // TODO https://online.sbis.ru/opendoc.html?guid=157084a2-d702-40b9-b54e-1a42853c301e
        for (const event of events) {
            if (window) {
                window[action](event, LoadingIndicator._eventsHandler, true);
                /**
                 * В оффлайне стрельнул баг: если отписываться с флагом true(несмотря на такую же подписку)
                 * отписка от события не произойдет. Вызываю дополнительно отписку без флага.
                 */
                if (!toggle) {
                    window[action](event, LoadingIndicator._eventsHandler);
                }
            }
        }
    }

    private _toggleOverlay(toggle: boolean, config: ILoadingIndicatorOptions): void {
        this._isOverlayVisible = toggle && config.overlay !== 'none';
        this._redrawOverlay();
    }

    private _clearOverlayTimerId(): void {
        if (this._toggleOverlayTimerId) {
            clearTimeout(this._toggleOverlayTimerId);
        }
    }

    private _toggleIndicatorVisible(toggle: boolean, config?: ILoadingIndicatorOptions): void {
        if (toggle) {
            this._clearOverlayTimerId();
            this._isMessageVisible = true;
            this._isOverlayVisible = true;
            this._toggleEvents(false);
            this._updateProperties(config);
        } else {
            this._isMessageVisible = false;
            this._isOverlayVisible = false;
        }
        this._redrawOverlay();
    }

    private _createOverlay(): void {
        const overlayDiv = document.createElement('div');
        overlayDiv.setAttribute('data-vdomignore', 'true');
        overlayDiv.setAttribute('tabindex', '1');

        const messageDiv = document.createElement('div');

        this._overlayDiv = overlayDiv;
        this._messageDiv = messageDiv;
    }

    private _redrawOverlay(): void {
        const container = this._container;
        if (!container) {
            return;
        }
        if (!this._overlayDiv) {
            this._createOverlay();
        }

        const overlayDiv = this._overlayDiv;
        const messageDiv = this._messageDiv;

        const currentOverlayVisibility = !!overlayDiv.parentElement;
        const nextOverlayVisibility = this._isOverlayVisible;
        if (nextOverlayVisibility) {
            const newOverlayClassName = this._calculateOverlayClassName();
            if (overlayDiv.className !== newOverlayClassName) {
                overlayDiv.className = newOverlayClassName;
            }
            if (this._zIndex) {
                overlayDiv.setAttribute('style', 'z-index: ' + this._zIndex);
            }
        }
        if (currentOverlayVisibility !== nextOverlayVisibility) {
            if (nextOverlayVisibility) {
                container.appendChild(overlayDiv);
            } else {
                container.removeChild(overlayDiv);
            }
        }

        const currentMessageVisibility = !!messageDiv.parentElement;
        const nextMessageVisibility = this._isMessageVisible;
        if (nextMessageVisibility) {
            const newMessageClassName = this._getThemedClassName('controls-loading-indicator-in');
            if (messageDiv.className !== newMessageClassName) {
                messageDiv.className = newMessageClassName;
            }
            if (messageDiv.innerText !== this.message) {
                messageDiv.innerText = this.message;
            }
        }
        if (currentMessageVisibility !== nextMessageVisibility) {
            if (nextMessageVisibility) {
                overlayDiv.appendChild(messageDiv);
            } else {
                overlayDiv.removeChild(messageDiv);
            }
        }
    }

    private _calculateOverlayClassName(): string {
        const classList = [this._getThemedClassName('controls-loading-indicator'), 'controls-Popup__isolatedFocusingContext'];

        classList.push(this.isGlobal ? 'controls-loading-indicator_global' : 'controls-loading-indicator_local');

        if (this.message) {
            classList.push('controls-loading-indicator_text');
        }
        if (this.scroll) {
            classList.push('controls-loading-indicator_scroll');
            classList.push('controls-loading-indicator_sided controls-loading-indicator_sided-' + this.scroll);
        }
        if (this.small) {
            classList.push('controls-loading-indicator_small');
            if (this.small !== 'yes') {
                classList.push('controls-loading-indicator_sided controls-loading-indicator_sided-' + this.small);
            }
        }
        if (this.overlay) {
            const overlayClassName = 'controls-loading-indicator_overlay-' + this._getOverlay(this.overlay);
            classList.push(this._getThemedClassName(overlayClassName));
        }
        if (this?.mods?.length) {
            classList.concat(this.mods.map((mod) => 'controls-loading-indicator_mod-' + mod));
        }

        return classList.join(' ');
    }

    private _getThemedClassName(simpleClassName: string): string {
        return simpleClassName + ' ' + simpleClassName + '_theme-' + this.theme;
    }

    static _eventsHandler(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    static _theme: string[] = ['Controls/_LoadingIndicator/LoadingIndicator'];
}

export {default as IndicatorOpener} from 'Controls/_LoadingIndicator/LoadingIndicatorOpener';
export {default as ILoadingIndicator, ILoadingIndicatorOptions} from 'Controls/_LoadingIndicator/interface/ILoadingIndicator';
export default LoadingIndicator;
