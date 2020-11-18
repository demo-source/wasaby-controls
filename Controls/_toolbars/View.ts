import {ICrudPlus, PrefetchProxy, Memory} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {factory, RecordSet} from 'Types/collection';
import {descriptor, Record} from 'Types/entity';

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {StickyOpener} from 'Controls/popup';
import {Controller as SourceController} from 'Controls/source';
import {showType, getMenuItems, needShowMenu} from 'Controls/Utils/Toolbar';

import {
    getButtonTemplate, hasSourceChanged,
    getButtonTemplateOptionsByItem, getTemplateByItem, loadItems, getSimpleButtonTemplateOptionsByItem
} from 'Controls/_toolbars/Util';
import {IStickyPopupOptions, IStickyPosition, IEventHandlers} from 'Controls/popup';

import {
    IHierarchy,
    IHierarchyOptions,
    IIconSize,
    IIconSizeOptions,
    IItemTemplate,
    IItemTemplateOptions,
    IItems,
    IItemsOptions
} from 'Controls/interface';
import {IItemAction, TItemActionVisibilityCallback} from 'Controls/itemActions';

import {IToolbarSourceOptions, default as IToolbarSource} from 'Controls/_toolbars/IToolbarSource';
import {IButtonOptions} from 'Controls/buttons';
import {IGrouped, IGroupedOptions} from 'Controls/dropdown';

import * as template from 'wml!Controls/_toolbars/View';
import * as defaultItemTemplate from 'wml!Controls/_toolbars/ItemTemplate';
import * as ActualAPI from 'Controls/_toolbars/ActualAPI';
import {DependencyTimer, isLeftMouseButton} from 'Controls/popup';
import {IoC} from "Env/Env";

type TItem = Record;
type TItems = RecordSet<TItem>;
type TypeItem = 'toolButton' | 'icon' | 'link' | 'list';
export type TItemsSpacing = 'medium' | 'big';

// Перейти на интерфейс выпадающих списков, когда он появится

export interface IMenuOptions {
    direction: IStickyPosition;
    targetPoint: IStickyPosition;
    eventHandlers: IEventHandlers;
    templateOptions: any;
    template: string;
}

/**
 * Интерфейс опций контрола {@link Controls/toolbars:View}.
 * @interface Controls/_toolbars/IToolbarOptions
 * @public
 * @author Красильников А.С.
 */
export interface IToolbarOptions extends IControlOptions, IHierarchyOptions, IIconSizeOptions,
    IItemTemplateOptions, IGroupedOptions, IToolbarSourceOptions, IItemsOptions<TItem> {
    /**
     * @name Controls/_toolbars/IToolbarOptions#popupClassName
     * @cfg {String} Имя класса, которое будет добавлено к атрибуту class на корневой ноде выпадающего меню.
     * @default ''
     */
    popupClassName: string;
    /**
     * @name Controls/_toolbars/IToolbarOptions#itemsSpacing
     * @cfg {String} Размер расстояния между кнопками.
     * @variant medium
     * @variant big
     * @default medium
     */
    itemsSpacing: TItemsSpacing;
    /**
     * @name Controls/_toolbars/View#additionalProperty
     * @cfg {String} Имя свойства, содержащего информацию о дополнительном пункте выпадающего меню. Подробное описание <a href="/doc/platform/developmentapl/interface-development/controls/dropdown-menu/item-config/#additional">здесь</a>.
     */
    additionalProperty?: string;
    /**
     * @name Controls/_toolbars/IToolbarOptions#popupFooterTemplate
     * @cfg {String|Function} Шаблон футера дополнительного меню тулбара.
     * @demo Controls-demo/Toolbar/PopupFooterTemplate/Index
     */
    popupFooterTemplate?: String | Function;

    /**
     * @name  Controls/_toolbars/IToolbarOptions#itemActions
     * @cfg {Array<ItemAction>} Конфигурация опций записи.
     * @demo Controls-demo/Toolbar/ItemActions/Index
     */
    itemActions?: IItemAction[];
    /**
     * @name Controls/_toolbars/IToolbarOptions#itemActionVisibilityCallback
     * @cfg {function} Функция управления видимостью операций над записью.
     * @param {ItemAction} action Объект с настройкой действия.
     * @param {Types/entity:Model} item Экземпляр записи, действие над которой обрабатывается.
     * @returns {Boolean} Определяет, должна ли операция отображаться.
     * @demo Controls-demo/Toolbar/ItemActions/Index
     */
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;

    /**
     * @name Controls/_toolbars/IToolbarOptions#menuSource
     * @cfg {Types/source:ICrudPlus} Объект реализующий интерфейс {@link Types/source:ICrud},
     * необходимый для работы с источником данных выпадающего меню тулбара.
     * Данные будут загружены отложенно, при взаимодействии с меню.
     * @link source
     * @link items
     */
    menuSource?: ICrudPlus;

    /**
     * @name Controls/_toolbars/IToolbarOptions#contrastBackground
     * @cfg {Boolean} Определяет наличие подложки у кнопки открытия выпадающего меню тулбара.
     */
    contrastBackground?: true;
}

/**
 * Графический контрол, отображаемый в виде панели с размещенными на ней кнопками, клик по которым вызывает соответствующие им команды.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FToolbar%2FBase%2FIndex">демо-пример</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_toolbars.less">переменные тем оформления</a>
 *
 *
 * @class Controls/_toolbars/View
 * @extends UI/Base:Control
 * @mixes Controls/interface:IHierarchy
 * @mixes Controls/interface:IIconSize
 * @mixes Controls/_toolbars/IToolbarOptions
 * @mixes Controls/_toolbars/IToolbarSource
 * @mixes Controls/interface:IItemTemplate
 * @mixes Controls/interface:IItems
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Toolbar/Base/Index
 */

class Toolbar extends Control<IToolbarOptions, TItems> implements IHierarchy, IIconSize, IItemTemplate,
    IGrouped, IToolbarSource, IItems {
    /*
     * Used in template
     */
    protected _needShowMenu: boolean = null;
    protected _fullItemsList: TItems = null;
    protected _items: TItems = null;
    protected _source: ICrudPlus = null;
    protected _sourceByItems: Memory = null;
    protected _menuSource: ICrudPlus = null;
    protected _nodeProperty: string = null;
    protected _parentProperty: string = null;
    protected _isLoadMenuItems: boolean = false;
    protected _firstItem: TItem = null;
    protected _buttonTemplate: TemplateFunction = getButtonTemplate();
    protected _actualItems: TItems = null;
    private _menuItems: {
        [key: number]: TItems
    } = {};

    protected _template: TemplateFunction = template;

    protected _dependenciesTimer: DependencyTimer = null;
    private _loadViewPromise: Promise<unknown> = null;

    _children: {
        menuTarget: HTMLElement
    };

    readonly '[Controls/_interface/IHierarchy]': boolean = true;
    readonly '[Controls/_toolbars/IToolbarSource]': boolean = true;
    readonly '[Controls/_interface/IIconSize]': boolean = true;
    readonly '[Controls/_interface/IItemTemplate]': boolean = true;
    readonly '[Controls/_interface/IItems]': boolean = true;
    readonly '[Controls/_dropdown/interface/IGrouped]': boolean = true;
    private _sticky: StickyOpener;

    constructor(...args) {
        super(args);

        this._resultHandler = this._resultHandler.bind(this);
        this._closeHandler = this._closeHandler.bind(this);
    }

    private _createMemory(items: TItems): Memory {
        return new Memory({
            data: items.getRawData(),
            keyProperty: items.getKeyProperty()
        });
    }

    private _setSourceByItems(items: TItem): void {
        if (!this._sourceByItems) {
            this._sourceByItems = this._createMemory(items);
        }
    }

    private _getSynchronousSourceForMenu(): ICrudPlus {
        if (this._options.items) {
            this._setSourceByItems(this._options.items);
            return this._sourceByItems;
        }
        if (this._source) {
            return this._source;
        }
    }

    private _getSourceForMenu(item: TItem): Promise<unknown> {
        if (this._options.menuSource) {
            return this._getMenuSource(item).then((source) => {
                return source;
            });
        }
        const source = this._getSynchronousSourceForMenu();
        return Promise.resolve(source);
    }

    private _getMenuSource(item: TItem): Promise<ICrudPlus> {
        const itemKey = item.get(this._options.keyProperty);
        if (!this._menuItems[itemKey]) {
            const filter = this._options.filter || {};
            filter[this._options.parentProperty] = itemKey;
            const sourceController = new SourceController({
                source: this._options.menuSource,
                keyProperty: this._options.keyProperty
            });
            return sourceController.load(filter).then((items) => {
                this._menuItems[itemKey] = items;
                const menuSource = this._createPrefetchProxy(this._options.menuSource, items);
                return menuSource;
            });
        } else {
            const source = this._createPrefetchProxy(this._options.menuSource, this._menuItems[itemKey]);
            return Promise.resolve(source);
        }
    }

    private _getMenuConfig(): IStickyPopupOptions {
        const options = this._options;
        return {
            ...this._getMenuOptions(),
            opener: this,
            className: `${options.popupClassName} controls-Toolbar__popup__list_theme-${options.theme}`,
            templateOptions: {
                source: this._menuSource,
                ...this._getMenuTemplateOptions(),
                itemActions: options.itemActions,
                itemActionVisibilityCallback: options.itemActionVisibilityCallback,
                additionalProperty: options.additionalProperty,
                footerContentTemplate: options.popupFooterTemplate,
                closeButtonVisibility: true
            },
            target: this._children.menuTarget
        };
    }

    private _getMenuTemplateOptions(): IStickyPopupOptions {
        const options = this._options;
        return {
            groupTemplate: options.groupTemplate,
            groupProperty: options.groupProperty,
            groupingKeyCallback: options.groupingKeyCallback,
            keyProperty: options.keyProperty,
            parentProperty: options.parentProperty,
            nodeProperty: options.nodeProperty,
            iconSize: options.iconSize,
            itemTemplateProperty: options.itemTemplateProperty
        };
    }

    private _getMenuConfigByItem(item: TItem, source: ICrudPlus, root: number): IStickyPopupOptions {
        const options = this._options;
        return {
            ...this._getMenuOptions(),
            opener: this,
            className: `controls-Toolbar__popup__${Toolbar._typeItem(item)}_theme-${options.theme} ${Toolbar._menuItemClassName(item)}`,
            targetPoint: {
                vertical: 'top',
                horizontal: 'left'
            },
            direction: {
                horizontal: 'right'
            },
            templateOptions: {
                source,
                root,
                ...this._getMenuTemplateOptions(),
                showHeader: item.get('showHeader'),
                closeButtonVisibility: !item.get('showHeader'),
                headConfig: {
                    icon: item.get('icon'),
                    caption: item.get('title'),
                    iconSize: item.get('iconSize'),
                    iconStyle: item.get('iconStyle')
                }
            }
        };
    }

    private _getMenuOptions(): IMenuOptions {
        return {
            direction: {
                horizontal: 'left'
            },
            targetPoint: {
                vertical: 'top',
                horizontal: 'right'
            },
            eventHandlers: {
                onResult: this._resultHandler,
                onClose: () => {
                    this._closeHandler();
                }
            },
            template: 'Controls/menu:Popup',
            closeOnOutsideClick: true,
            actionOnScroll: 'close',
            fittingMode: {
                vertical: 'adaptive',
                horizontal: 'overflow'
            }
        };
    }

    private _setState(options: IToolbarOptions): void {
        this._nodeProperty = options.nodeProperty;
        this._parentProperty = options.parentProperty;
    }

    private _createPrefetchProxy(source: ICrudPlus, items: TItems): ICrudPlus {
        return new PrefetchProxy({
            target: source,
            data: {
                query: items
            }
        });
    }

    private _setMenuSource(): void {
        const menuItems = Toolbar._calcMenuItems(this._actualItems);

        if (this._options.menuSource) {
            this._menuSource = this._options.menuSource;
        } else {
            const source = this._options.source || this._getSynchronousSourceForMenu();
            this._menuSource = this._createPrefetchProxy(source, menuItems);
        }
    }

    private _setStateByItems(items: TItems, source?: ICrudPlus): void {
        this._fullItemsList = items;
        this._firstItem = null;
        // TODO: Удалить ActualAPI https://online.sbis.ru/opendoc.html?guid=d6fb9444-66f5-481d-8fd3-636b4d4ab676
        this._actualItems = this._options.isNewOptions ? items : ActualAPI.items(items.clone());
        this._items = this._actualItems;
        if (source) {
            this._source = this._createPrefetchProxy(source, this._actualItems);
        }
        this._needShowMenu = needShowMenu(this._actualItems);
    }

    private _needChangeState(newOptions: IToolbarOptions): boolean {
        const currentOptions = this._options;

        return [
            'keyProperty',
            'parentProperty',
            'nodeProperty',
            'popupClassName'
        ].some((optionName: string) => currentOptions[optionName] !== newOptions[optionName]);
    }

    private _openMenu(config: IStickyPopupOptions): void {
        /**
         * TODO нотифай событий menuOpened и menuClosed нужен для работы механизма корректного закрытия превьювера переделать
         * по задаче https://online.sbis.ru/opendoc.html?guid=76ed6751-9f8c-43d7-b305-bde84c1e8cd7
         */
        this._notify('menuOpened', [], {bubbling: true});

        if (!this._sticky) {
            this._sticky = new StickyOpener();
        }
        this._sticky.open(config);
    }

    protected _beforeMount(options: IToolbarOptions, context: {}, receivedItems?: TItems): Promise<TItems> {
        this._setState(options);

        //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=7d618623-243a-4aa2-a533-215f06e137e1
        this._isShowToolbar = this._isShowToolbar.bind(this);

        if (options.source) {
            if (receivedItems) {
                this._setStateByItems(receivedItems, options.source);
            } else {
                return this.setStateBySource(options.source);
            }
        } else if (options.items) {
            this._setStateByItems(options.items);
        }
    }

    protected _beforeUpdate(newOptions: IToolbarOptions): void {
        if (this._needChangeState(newOptions)) {
            this._setState(newOptions);
        }
        if (hasSourceChanged(newOptions.source, this._options.source)) {
            this._isLoadMenuItems = false;
            this._sticky?.close();
            this.setStateBySource(newOptions.source);
        }
        if (this._options.items !== newOptions.items) {
            this._isLoadMenuItems = false;
            this._sourceByItems = null;
            this._setStateByItems(newOptions.items);
        }
        if (this._options.menuSource !== newOptions.menuSource) {
            this._menuItems = {};
            this._isLoadMenuItems = false;
            this._setMenuSource();
        }
    }

    protected _beforeUnmount(): void {
        this._sticky?.destroy();
        this._sticky = null;
    }

    protected _resultHandler(action, data, nativeEvent): void {
        if (action === 'itemClick') {
            const item = data;
            this._notify('itemClick', [item, nativeEvent]);

            /**
             * menuOpener may not exist because toolbar can be closed by toolbar parent in item click handler
             */
            if (this._sticky.isOpened() && !item.get(this._nodeProperty)) {
                this._sticky.close();
            }
        }
    }

    protected setStateBySource(source: ICrudPlus): Promise<TItems> {
        return loadItems(source).then((items) => {
            this._setStateByItems(items, source);
            return items;
        });
    }

    protected _closeHandler(): void {
        this._notify('menuClosed', [], {bubbling: true});
        this._setStateByItems(this._fullItemsList, this._options.source);
        this._setMenuSource();
    }

    protected _itemClickHandler(event: SyntheticEvent<MouseEvent>, item: TItem): void {
        const readOnly: boolean = item.get('readOnly') || this._options.readOnly;

        if (readOnly) {
            event.stopPropagation();
            return;
        }

        if (item.get(this._nodeProperty)) {
            this._getSourceForMenu(item).then((source) => {
                const root = item.get(this._options.keyProperty);
                let menuSource = source;

                const config = this._getMenuConfigByItem(item, menuSource, root);
                this._openMenu({
                    ...config,
                    target: event.currentTarget
                });
            });
        }

        this._notify('itemClick', [item, event.nativeEvent]);
        event.stopPropagation();
    }

    protected _getTemplateByItem(item: TItem): TemplateFunction {
        return getTemplateByItem(item, this._options);
    }

    protected _getButtonTemplateOptionsByItem(item: TItem): IButtonOptions {
        return getButtonTemplateOptionsByItem(item, this._options);
    }

    protected _getSimpleButtonTemplateOptionsByItem(item: TItem): IButtonOptions {
        return getSimpleButtonTemplateOptionsByItem(item, this._options);
    }

    protected _mouseDownHandler(event: SyntheticEvent<MouseEvent>): void {
        if (!isLeftMouseButton(event)) {
            return;
        }

        if (!this._options.readOnly) {
            const menuConfig = this._getMenuConfig();
            if (!this._isLoadMenuItems) {
                this._setMenuSource();
                this._isLoadMenuItems = true;
            }
            this._openMenu(this._getMenuConfig());
        }
    }
    protected _onClickHandler(event: SyntheticEvent): void {
        event.stopPropagation();
    }

    protected _mouseEnterHandler() {
        if (!this._options.readOnly) {
            if (!this._dependenciesTimer) {
                this._dependenciesTimer = new DependencyTimer();
            }
            this._dependenciesTimer.start(this._loadDependencies.bind(this));
        }
    }

    protected _mouseLeaveHandler(): void {
        this._dependenciesTimer?.stop();
    }

    private _loadDependencies(): Promise<unknown> {
        try {
            if (!this._isLoadMenuItems) {
                this._setMenuSource();
                this._isLoadMenuItems = true;
            }

            if (!this._loadViewPromise) {
                this._loadViewPromise = import('Controls/menu');
            }
            return this._loadViewPromise;
        } catch (e) {
            IoC.resolve('ILogger').error('_toolbars:View', e);
        }
    }

    private _setFirstItem(item: TItem): void {
        if (!this._firstItem) {
            this._firstItem = item;
        }
    }

    /**
     * Used in template
     */
    protected _isShowToolbar(item: TItem, parentProperty: string): boolean {
        const itemShowType = item.get('showType');

        if (itemShowType === showType.MENU) {
            return false;
        }
        const itemHasParentProperty = item.has(parentProperty) && item.get(parentProperty) !== null;
        if (itemHasParentProperty) {
            if (itemShowType === showType.MENU_TOOLBAR) {
                // у первой записи тулбара не требуется показывать отступ слева
                this._setFirstItem(item);
                return true;
            }
            return false;
        }

        this._setFirstItem(item);
        return true;
    }

    static _theme: string[] = ['Controls/buttons', 'Controls/Classes', 'Controls/toolbars'];

    private static _typeItem(item: TItem): TypeItem {
        if (item.get('icon')) {
            return 'icon';
        }
        if (item.get('viewMode') === 'toolButton') {
            return 'toolButton';
        }

        return 'link';
    }

    private static _menuItemClassName(item: TItem): string {
        const menuClassName = item.get('popupClassName');

        if (menuClassName) {
            return menuClassName;
        }

        return '';
    }

    private static _calcMenuItems(items: TItems): TItems {
        return getMenuItems<TItem>(items).value(factory.recordSet, {
            adapter: items.getAdapter(),
            keyProperty: items.getKeyProperty(),
            format: items.getFormat()
        });
    }

    static getDefaultOptions() {
        return {
            menuSource: null,
            popupClassName: '',
            itemsSpacing: 'medium',
            iconSize: 'm',
            itemTemplate: defaultItemTemplate
        };
    }

    static getOptionTypes() {
        return {
            popupClassName: descriptor(String),
            itemsSpacing: descriptor(String).oneOf([
                'medium',
                'big'
            ])
        };
    }
}

/**
 * @event Происходит при клике по элементу.
 * @name Controls/_toolbars/View#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Record} item Элемент, по которому производим клик.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.toolbars:View on:itemClick="onToolbarItemClick()" />
 * </pre>
 * JS:
 * <pre>
 *    onToolbarItemClick: function(e, selectedItem) {
 *       var itemId = selectedItem.get('id');
 *       switch (itemId) {
 *          case 'remove':
 *             this._removeItems();
 *             break;
 *          case 'move':
 *             this._moveItems();
 *             break;
 *    }
 * </pre>
 */

export default Toolbar;
