import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ActualApi from './ActualApi';
import {IHref, IHrefOptions} from './interface/IHref';
import {IButton, IButtonOptions} from './interface/IButton';
import {IClick} from './interface/IClick';
import {
    ICaption,
    ICaptionOptions,
    IFontColorStyle,
    IFontColorStyleOptions,
    IFontSize,
    IFontSizeOptions,
    IHeight,
    IHeightOptions,
    IIcon,
    IIconOptions,
    IIconSize,
    IIconSizeOptions,
    IIconStyle,
    IIconStyleOptions,
    ITooltip,
    ITooltipOptions
} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import ButtonTemplate = require('wml!Controls/_buttons/Button');
import 'wml!Controls/_buttons/ButtonBase';

export interface IButtonControlOptions extends IControlOptions, IHrefOptions, ICaptionOptions, IIconOptions,
       IIconStyleOptions, IIconSizeOptions, IFontColorStyleOptions, IFontSizeOptions, IHeightOptions, ITooltipOptions,
       IButtonOptions {
    viewMode?: 'button' | 'link' | 'toolButton';
}

export function cssStyleGeneration(options: IButtonControlOptions): void {
    const currentButtonClass = ActualApi.styleToViewMode(options.style);
    const oldViewModeToken = ActualApi.viewMode(currentButtonClass.viewMode, options.viewMode);

    this._buttonStyle = ActualApi.buttonStyle(currentButtonClass.style, options.style, options.buttonStyle, options.readOnly);
    this._contrastBackground = ActualApi.contrastBackground(options);
    this._viewMode = oldViewModeToken.viewMode;
    if (typeof oldViewModeToken.contrast !== 'undefined') {
        this._contrastBackground = oldViewModeToken.contrast;
    }
    this._height = ActualApi.actualHeight(options.size, options.inlineHeight, this._viewMode);
    this._fontColorStyle = ActualApi.fontColorStyle(this._buttonStyle, this._viewMode, options.fontColorStyle);
    this._fontSize = ActualApi.fontSize(options);
    this._hasIcon = !!options.icon;

    this._caption = options.caption;
    this._stringCaption = typeof options.caption === 'string';

    this._icon = options.icon;
    this._iconSize = options.icon ? ActualApi.iconSize(options) : '';
    this._iconStyle = options.icon ? ActualApi.iconStyle(options) : '';
}

/**
 * Графический контрол, который предоставляет пользователю возможность простого запуска события при нажатии на него.
 * @remark
 * Кнопки могут отображаться в нескольких режимах, отличающихся друга от друга внешне.
 * Более подробное описание можно найти <a href='/doc/platform/developmentapl/interface-development/controls/buttons/'>здесь</a>
 *
 * <a href="/materials/demo-ws4-buttons">Демо-пример</a>.
 *
 * @class Controls/_buttons/Button
 * @extends Core/Control
 * @mixes Controls/_buttons/interface/IHref
 * @mixes Controls/_buttons/interface/IButton
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_buttons/interface/IClick
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/ITooltip
 * @control
 * @public
 * @author Красильников А.С.
 * @category Button
 * @demo Controls-demo/Buttons/ViewModes/Index
 * @demo Controls-demo/Buttons/SizesAndHeights/Index
 * @demo Controls-demo/Buttons/FontStyles/Index
 * @demo Controls-demo/Buttons/IconStyles/Index
 * @demo Controls-demo/Buttons/ContrastBackground/Index
 */

/*
 * Graphical control element that provides the user a simple way to trigger an event.
 *
 * <a href="/materials/demo-ws4-buttons">Demo-example</a>.
 *
 * @class Controls/_buttons/Button
 * @extends Core/Control
 * @mixes Controls/_buttons/interface/IHref
 * @mixes Controls/_buttons/interface/IButton
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_buttons/interface/IClick
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/ITooltip
 * @control
 * @public
 * @author Красильников А.С.
 * @category Button
 * @demo Controls-demo/Buttons/ButtonDemoPG
 */
/**
 * @name Controls/_buttons/Button#viewMode
 * @cfg {Enum} Режим отображения кнопки.
 * @variant button В виде обычной кнопки по-умолчанию.
 * @variant link В виде гиперссылки.
 * @variant toolButton В виде кнопки для панели инструментов.
 * @default button
 * @demo Controls-demo/Buttons/ViewModes/Index
 * @example
 * Кнопка в режиме отображения 'link'.
 * <pre>
 *    <Controls.breadcrumbs:Path caption="Send document" style="primary" viewMode="link" size="xl"/>
 * </pre>
 * Кнопка в режиме отображения 'toolButton'.
 * <pre>
 *    <Controls.breadcrumbs:Path caption="Send document" style="danger" viewMode="toolButton"/>
 * </pre>
 * Кнопка в режиме отображения 'button'.
 * <pre>
 *    <Controls.breadcrumbs:Path caption="Send document" style="success" viewMode="button"/>
 * </pre>
 * @see Size
 */

/*
 * @name Controls/_buttons/Button#viewMode
 * @cfg {Enum} Button view mode.
 * @variant link Decorated hyperlink.
 * @variant button Default button.
 * @variant toolButton Toolbar button.
 * @default button
 * @example
 * Button with 'link' viewMode.
 * <pre>
 *    <Controls.breadcrumbs:Path caption="Send document" style="primary" viewMode="link" size="xl"/>
 * </pre>
 * Button with 'toolButton' viewMode.
 * <pre>
 *    <Controls.breadcrumbs:Path caption="Send document" style="danger" viewMode="toolButton"/>
 * </pre>
 * Button with 'button' viewMode.
 * <pre>
 *    <Controls.breadcrumbs:Path caption="Send document" style="success" viewMode="button"/>
 * </pre>
 * @see Size
 */
class Button extends Control<IButtonControlOptions> implements
      IHref, ICaption, IIcon, IIconStyle, ITooltip, IIconSize, IClick, IFontColorStyle, IFontSize, IHeight, IButton {
   protected _template: TemplateFunction = ButtonTemplate;

   // Называть _style нельзя, так как это состояние используется для темизации
   private _buttonStyle: string;
   private _fontColorStyle: string;
   private _fontSize: string;
   private _contrastBackground: boolean;
   private _hasIcon: boolean;
   private _viewMode: string;
   private _height: string;
   private _state: string;
   private _caption: string | TemplateFunction;
   private _stringCaption: boolean;
   private _icon: string;
   private _iconSize: string;
   private _iconStyle: string;
   protected _hoverIcon: boolean = true;

   protected _beforeMount(options: IButtonControlOptions): void {
      cssStyleGeneration.call(this, options);
   }

   protected _beforeUpdate(newOptions: IButtonControlOptions): void {
      cssStyleGeneration.call(this, newOptions);
   }

   private _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
      if (e.nativeEvent.keyCode === 13 && !this._options.readOnly) {
         this._notify('click');
      }
   }

   private _clickHandler(e: SyntheticEvent<MouseEvent>): void {
      if (this._options.readOnly) {
         e.stopPropagation();
      }
   }

   static _theme: string[] = ['Controls/buttons', 'Controls/Classes'];

   static getDefaultOptions(): object {
      return {
         viewMode: 'button',
         iconStyle: 'secondary',
         theme: 'default'
      };
   }
}

export default Button;
