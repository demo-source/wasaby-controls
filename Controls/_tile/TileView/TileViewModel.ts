import {ListViewModel} from 'Controls/list';
import cMerge = require('Core/core-merge');
import {Logger} from 'UI/Utils';
import {object} from 'Types/util';
import {Model} from 'Types/entity';
import {getImageUrl, getImageSize, getImageClasses, IMAGE_FIT} from './resources/imageUtil';
import {ZOOM_DELAY, ZOOM_COEFFICIENT, TILE_SCALING_MODE} from './resources/Constants';
import {SyntheticEvent} from 'Vdom/Vdom';

const DEFAULT_ITEM_WIDTH = 250;
const DEFAULT_ITEM_HEIGHT = 200;
const ITEM_COMPRESSION_COEFFICIENT = 0.7;
const DEFAULT_SCALE_COEFFICIENT = 1.5;
const DEFAULT_WIDTH_PROPORTION = 1;

const TILE_SIZES = {
    s: {
        horizontal: {
            width: 210,
            imageHeight: 180
        },
        vertical: {
            width: 390,
            imageWidth: 300
        }
    },
    m: {
        horizontal: {
            width: 310,
            imageHeight: 240
        },
        vertical: {
            width: 390,
            imageWidth: 160
        }
    },
    l: {
        horizontal: {
            width: 420,
            imageHeight: 320
        },
        vertical: {
            width: 640,
            imageWidth: 300
        }
    }
};

var TileViewModel = ListViewModel.extend({
    constructor() {
        TileViewModel.superclass.constructor.apply(this, arguments);
        this._tileMode = this._options.tileMode;
        if (this._options.hasOwnProperty('itemsHeight')) {
            Logger.warn(this._moduleName + ': Используется устаревшая опция itemsHeight, используйте tileHeight', this);
        }
        this._itemsHeight = this._options.tileHeight || this._options.itemsHeight || DEFAULT_ITEM_HEIGHT;
    },

    getItemDataByItem: function (dispItem) {
        let current = TileViewModel.superclass.getItemDataByItem.apply(this, arguments);

        if (current._tileViewModelCached) {
            return current;
        } else {
            current._tileViewModelCached = true;
        }
        // todo remove multiSelectVisibility, multiSelectPosition and multiSelectClassList by task:
        // https://online.sbis.ru/opendoc.html?guid=50811b1e-7362-4e56-b52c-96d63b917dc9
        current.multiSelectVisibility = this._options.multiSelectVisibility;
        current.multiSelectPosition = this._options.multiSelectPosition;

        current = cMerge(current, this.getTileItemData(dispItem));

        if (current.hasMultiSelect) {
            current.multiSelectClassList += ` controls-TileView__checkbox_position-${current.multiSelectPosition}_theme-${current.theme} ` +
                'controls-TileView__checkbox controls-TileView__checkbox_top js-controls-TileView__withoutZoom';
        }
        return current;
    },

    getCurrent: function (dispItem) {
        var current = TileViewModel.superclass.getCurrent.apply(this, arguments);
        current = cMerge(current, this.getTileItemData(dispItem));
        return current;
    },

    getTileSizes(tileSize: string, imagePosition: string = 'top', imageViewMode: string = 'rectangle'): object {
        const sizeParams = object.clone(TILE_SIZES[tileSize]);
        const tileSizes = sizeParams[imagePosition === 'top' ? 'horizontal' : 'vertical'];
        if (imagePosition === 'top') {
            tileSizes.imageWidth = null;
            if (imageViewMode !== 'rectangle') {
                tileSizes.imageHeight = null;
            }
        } else if (imageViewMode !== 'rectangle') {
            tileSizes.imageHeight = tileSizes.imageWidth;
        }
        return tileSizes;
    },

    getImageData(itemWidth: number,
                 itemData: Record<string, any>,
                 item: Model): {url: string, class: string} {
        const {
            itemsHeight,
            tileMode,
            imageHeightProperty,
            imageWidthProperty,
            imageUrlResolver,
            imageProperty,
            imageFit} = itemData;
        const imageHeight = item.get(imageHeightProperty) && Number(item.get(imageHeightProperty));
        const imageWidth = item.get(imageWidthProperty) && Number(item.get(imageWidthProperty));
        let baseUrl = item.get(imageProperty);
        if (imageFit === IMAGE_FIT.COVER) {
            const sizes = getImageSize(
                Number(itemWidth),
                Number(itemsHeight),
                tileMode,
                imageHeight,
                imageWidth,
                imageFit);
            baseUrl = getImageUrl(sizes.width, sizes.height, baseUrl, item, imageUrlResolver);
        }
        return {
            url: baseUrl,
            class: getImageClasses(imageFit)
        };
    },

    getTileItemData: function (dispItem): Record<string, any> {
        const resultData: Record<string, any> =  {
            displayProperty: this._options.displayProperty,
            tileMode: this._tileMode,
            itemsHeight: this._itemsHeight,
            imageProperty: this._options.imageProperty,
            defaultItemWidth: DEFAULT_ITEM_WIDTH,
            defaultShadowVisibility: 'visible',
            itemCompressionCoefficient: ITEM_COMPRESSION_COEFFICIENT,
            imageHeightProperty: this._options.imageHeightProperty,
            imageWidthProperty: this._options.imageWidthProperty,
            imageFit: this._options.imageFit,
            imageUrlResolver: this._options.imageUrlResolver,
            itemClasses: this.getItemPaddingClasses()
        };
        if (this._options.tileSize) {
            resultData.getTileSizes = this.getTileSizes;
        }
        const itemContents = dispItem?.getContents();
        if (itemContents instanceof Model) {
            resultData.itemWidth = this.getTileWidth(
                itemContents, this._options.imageWidthProperty, this._options.imageHeightProperty);
        } else {
            resultData.itemWidth = this._options.tileWidth || DEFAULT_ITEM_WIDTH;
        }
        return resultData;
    },

    setTileMode: function (tileMode) {
        this._tileMode = tileMode;
        this._nextModelVersion();
    },

    getTileMode: function () {
        return this._tileMode;
    },

    setItemsHeight: function (itemsHeight) {
        this._itemsHeight = itemsHeight;
        this._nextModelVersion();
    },

    getItemsHeight: function () {
        return this._itemsHeight;
    },

    setHoveredItem: function (hoveredItem) {
        if (this._hoveredItem !== hoveredItem) {
            this._hoveredItem = hoveredItem;
            this._nextModelVersion(true, 'hoveredItemChanged');
        }
    },

    getHoveredItem: function () {
        return this._hoveredItem;
    },

    _calcItemVersion: function (item, key) {
        let version = TileViewModel.superclass._calcItemVersion.apply(this, arguments);

        if (this._hoveredItem && this._hoveredItem.key === key) {
            version = `HOVERED_${version}`;
        }

        return version;
    },

    // TODO работа с activeItem Должна производиться через item.isActive(),
    //  но из-за того, как в TileView организована работа с isHovered, isScaled и isAnimated
    //  мы не можем снять эти состояния при клике внутри ItemActions
    setActiveItem: function (activeItem) {
        if (!activeItem) {
            this.setHoveredItem(null);
        }
        TileViewModel.superclass.setActiveItem.apply(this, arguments);
    },

    _onCollectionChange(event, action, newItems, newItemsIndex, removedItems, removedItemsIndex): void {
        // TODO https://online.sbis.ru/opendoc.html?guid=b8b8bd83-acd7-44eb-a915-f664b350363b
        //  Костыль, позволяющий определить, что мы загружаем файл и его прогрессбар изменяется
        //  Это нужно, чтобы не сбрасывался hovered в плитке при изменении прогрессбара
        if (!this._isLoadingPercentsChanged(newItems)) {
            this.setHoveredItem(null);
        }
        TileViewModel.superclass._onCollectionChange.apply(this, arguments);
    },

    setDragEntity: function () {
        this.setHoveredItem(null);
        TileViewModel.superclass.setDragEntity.apply(this, arguments);
    },

    getItemPaddingClasses(): string {
        return this.getPaddingClasses('item');
    },

    getItemsPaddingContainerClasses(): string {
        return this.getPaddingClasses('itemPaddingContainer');
    },

    getPaddingClasses(classPrefix: string = 'item'): string {
        const leftSpacing = this._options.itemPadding?.left || 'default';
        const rightSpacing = this._options.itemPadding?.right || 'default';
        const bottomSpacing = this._options.itemPadding?.bottom || 'default';
        const topSpacing = this._options.itemPadding?.top || 'default';
        const theme = `_theme-${this._options.theme}`;

        const leftSpacingClass = `controls-TileView__${classPrefix}_spacingLeft_${leftSpacing}${theme}`;
        const rightSpacingClass = `controls-TileView__${classPrefix}_spacingRight_${rightSpacing}${theme}`;
        const topSpacingClass = `controls-TileView__${classPrefix}_spacingTop_${topSpacing}${theme}`;
        const bottomSpacingClass = `controls-TileView__${classPrefix}_spacingBottom_${bottomSpacing}${theme}`;

        return `${leftSpacingClass} ${rightSpacingClass} ${topSpacingClass} ${bottomSpacingClass}`;
    },

    getTileWidth(
        item: Model,
        imageWidthProperty: string,
        imageHeightProperty: string
    ): number {
        const imageHeight = imageHeightProperty && Number(item.get(imageHeightProperty));
        const imageWidth = imageWidthProperty && Number(item.get(imageWidthProperty));
        const itemWidth = item.get(this._options.tileWidthProperty) || this._options.tileWidth || DEFAULT_ITEM_WIDTH;
        let widthProportion = DEFAULT_WIDTH_PROPORTION;
        let resultWidth = null;
        if (this.getTileMode() === 'dynamic') {
            if (imageHeight && imageWidth) {
                const imageProportion = imageWidth / imageHeight;
                widthProportion = Math.min(DEFAULT_SCALE_COEFFICIENT,
                    Math.max(imageProportion, ITEM_COMPRESSION_COEFFICIENT));
            } else if (this._options.tileFitProperty) {
                return this._itemsHeight * (item.get(this._options.tileFitProperty) || ITEM_COMPRESSION_COEFFICIENT);
            }
        } else {
            return itemWidth;
        }
        resultWidth = Math.floor(Number(this._itemsHeight) * widthProportion);
        return itemWidth ? Math.max(resultWidth, itemWidth) : resultWidth;
    },

    getActionsMenuConfig(
        itemData,
        clickEvent: SyntheticEvent,
        opener,
        templateOptions,
        isActionMenu
    ): Record<string, any> {
        if (this._options.actionMenuViewMode === 'preview' && !isActionMenu) {
            const MENU_MAX_WIDTH = 200;
            const menuOptions = templateOptions;
            /* TODO Вынести этот код из модели в контрол плитки
               https://online.sbis.ru/opendoc.html?guid=7f6ac2cf-15e6-4b75-afc6-928a86ade83e */
            const itemContainer = clickEvent.target.closest('.controls-TileView__item');
            const imageWrapper = itemContainer.querySelector('.controls-TileView__imageWrapper');
            if (!imageWrapper) {
                return null;
            }
            let previewWidth = imageWrapper.clientWidth;
            let previewHeight = imageWrapper.clientHeight;
            menuOptions.image = itemData.imageData.url;
            menuOptions.title = itemData.item.get(itemData.displayProperty);
            menuOptions.additionalText = itemData.item.get(templateOptions.headerAdditionalTextProperty);
            if (this._options.tileScalingMode === TILE_SCALING_MODE.NONE) {
                previewHeight = previewHeight * ZOOM_COEFFICIENT;
                previewWidth = previewWidth * ZOOM_COEFFICIENT;
            }
            menuOptions.previewHeight = previewHeight;
            menuOptions.previewWidth = previewWidth;

            return {
                templateOptions,
                closeOnOutsideClick: true,
                maxWidth: menuOptions.previewWidth + MENU_MAX_WIDTH,
                target: imageWrapper,
                className: 'controls-TileView__itemActions_menu_popup',
                targetPoint: {
                    vertical: 'top',
                    horizontal: 'left'
                },
                opener,
                template: 'Controls/tile:ActionsMenu',
                actionOnScroll: 'close'
            };
        } else {
            return null;
        }
    }
});

export = TileViewModel;
