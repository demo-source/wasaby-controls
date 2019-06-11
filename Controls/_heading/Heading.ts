import{Control, IControlOptions, TemplateFunction} from 'UI/Base';
import headingTemplate = require('wml!Controls/_heading/Heading/Heading');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ITooltip, ITooltipOptions, ICaption, ICaptionOptions} from 'Controls/interface';

export interface IHeadingOptions extends IControlOptions, ICaptionOptions, ITooltipOptions {
   fontSize?: string;
   fontColorStyle?: string;
   size?: string;
   style?: string;
}

   /**
    * Heading with support different display styles and sizes. Can be used independently or as part of complex headings(you can see it in <a href="/materials/demo-ws4-header-separator">Demo-example</a>) consisting of a <a href="/docs/js/Controls/_heading/Counter/?v=3.18.500">counter</a>, a <a href="/docs/js/Controls/_heading/Separator/?v=3.18.500">header-separator</a> and a <a href="/docs/js/Controls/Button/Separator/?v=3.18.500">button-separator</a>.
    *
    * <a href="/materials/demo-ws4-header-separator">Demo-example</a>.
    *
    *
    * @class Controls/_heading/Heading
    * @extends Core/Control
    * @control
    * @public
    * @author Михайловский Д.С.
    * @demo Controls-demo/Headers/headerDemo
    *
    * @mixes Controls/_interface/ITooltip
    * @mixes Controls/_interface/ICaption
    * @mixes Controls/_heading/Heading/HeadingStyles
    */

/**
 * @name Controls/_heading/Heading#fontSize
 * @cfg {String} Heading font-size.
 * @variant xs Extra small text size.
 * @variant s Small text size.
 * @variant m Medium text size.
 * @variant l Large text size.
 * @variant xl Extra large text size.
 * @variant 2xl 2*Extra large text size.
 * @variant 3xl 3*Extra large text size.
 * @variant 4xl 4*Extra large text size.
 * @variant 5xl 5*Extra large text size.
 * @default l
 */


   /**
    * @name Controls/_heading/Heading#fontColorStyle
    * @cfg {String} Heading display style.
    * @variant primary
    * @variant secondary
    * @variant info
    * @variant default
    * @variant danger
    * @variant success
    * @default primary
    */
const mapFontSize = {'s': 'm', 'm': 'l', 'l': '3xl', 'xl': '4xl'};
class Header extends Control<IHeadingOptions> implements ICaption, ITooltip {
      // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
      protected _template: TemplateFunction = headingTemplate;
      protected _theme: string[] = ['Controls/heading'];
      protected _fontSize: string;
      protected _fontColorStyle: string;
      private _prepareOptions(options: IHeadingOptions): void {
          if(options.size){
              this._fontSize = mapFontSize[options.size];
          } else {
              this._fontSize = options.fontSize;
          }
          if(options.style){
              this._fontColorStyle = options.style;
          } else {
              this._fontColorStyle = options.fontColorStyle;
          }
      }
    protected _beforeMount(options: IHeadingOptions): void {
          this._prepareOptions(options);
    }
    protected _beforeUpdate(options: IHeadingOptions): void {
        this._prepareOptions(options);
    }
      static getDefaultOptions(): object {
         return {
            fontColorStyle: 'secondary',
            fontSize: 'l',
            theme: 'default'
         };
      }
      static getOptionTypes(): object {
         return {
            caption: EntityDescriptor(String),
             fontColorStyle: EntityDescriptor(String).oneOf([
               'secondary',
               'primary',
               'info',
                 'danger',
                 'success',
                 'default'
            ]),
             fontSize: EntityDescriptor(String).oneOf([
                 'xs',
                 's',
                 'm',
                 'l',
                 'xl',
                 '2xl',
                 '3xl',
                 '4xl',
                 '5xl'
             ])
         };
      }
      '[Controls/_interface/ITooltip]': true;
      '[Controls/_interface/ICaption]': true;
   }

export default Header;
