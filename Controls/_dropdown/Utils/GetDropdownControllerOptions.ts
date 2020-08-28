import {IDropdownControllerOptions} from 'Controls/_dropdown/interface/IDropdownController';

export default function getDropdownControllerOptions(options: IDropdownControllerOptions, controlConfig): IDropdownControllerOptions {
    const menuOptions = { ...{
        keyProperty: options.keyProperty,
        emptyText: options.emptyText,
        itemActions: options.itemActions,
        allowPin: options.allowPin,
        width: options.width,
        className: options.popupClassName,
        dropdownClassName: options.dropdownClassName,
        marker: options.marker,
        displayProperty: options.displayProperty,
        multiSelect: options.multiSelect,
        typeShadow: options.typeShadow,
        selectorTemplate: options.selectorTemplate,
        headerContentTemplate: options.headerContentTemplate,
        footerContentTemplate: options.footerContentTemplate || options.footerTemplate,
        itemTemplateProperty: options.itemTemplateProperty,
        itemTemplate: options.itemTemplate,
        footerTemplate: options.footerTemplate,
        nodeFooterTemplate: options.nodeFooterTemplate,
        closeButtonVisibility: options.closeButtonVisibility,
        headTemplate: options.headTemplate,
        headerTemplate: options.headerTemplate || options.headTemplate,
        targetPoint: options.targetPoint,
        menuPopupOptions: options.menuPopupOptions,
        additionalProperty: options.additionalProperty,
        groupingKeyCallback: options.groupingKeyCallback,
        parentProperty: options.parentProperty,
        nodeProperty: options.nodeProperty,
        headingCaption: options.headingCaption,
        headingIcon: options.headingIcon,
        headingIconSize: options.headingIconSize,
        iconSize: options.iconSize,
        hasIconPin: options.hasIconPin,
        showHeader: options.showHeader,
        headConfig: options.headConfig,
        groupTemplate: options.groupTemplate,
        groupProperty: options.groupProperty,
        searchParam: options.searchParam,
        minSearchLength: options.minSearchLength,
        searchDelay: options.searchDelay,
        searchValueTrim: options.searchValueTrim
    }, ...controlConfig};
    return  {
        lazyItemsLoading: options.lazyItemsLoading,
        navigation: options.navigation,
        menuOptions,
        openerControl: options.openerControl,
        readOnly: options.readOnly,
        selectedKeys: options.selectedKeys,
        selectedItemsChangedCallback: options.selectedItemsChangedCallback,
        dataLoadErrback: options.dataLoadErrback,
        theme: options.theme
    };
}
