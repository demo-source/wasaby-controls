/**
 * Интерфейс опций контролов, которые поддерживают разные размеры шрифта.
 * @public
 * @author Красильников А.С.
 */
export interface IFontSizeOptions {
   /**
    * Размер шрифта.
    * @remark
    * Размер шрифта задается константой из стандартного набора размеров шрифта, который определен для текущей темы оформления.
    * @variant inherit
    * @variant xs
    * @variant s
    * @variant m
    * @variant l
    * @variant xl
    * @variant 2xl
    * @variant 3xl
    * @variant 4xl
    * @variant 5xl
    * @variant 6xl
    * @variant 7xl
    * @default l
    * @see Icon
    */
   fontSize?: string;
}

/**
 * Интерфейс для контролов, которые поддерживают разные размеры шрифта.
 * @public
 * @author Красильников А.С.
 */
export default interface IFontSize {
   readonly '[Controls/_interface/IFontSize]': boolean;
}

/*
 * Interface for control, which has different font sizes
 * @public
 */

/*
 * @name Controls/_interface/IFontSize#fontSize
 * @cfg {Enum} Font size value
 * @variant inherit
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @variant 2xl
 * @variant 3xl
 * @variant 4xl
 * @variant 5xl
 * @example
 * Button with xl font size.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" fontSize="xl" viewMode="button"/>
 * </pre>
 * @see Icon
 */
