import {TemplateFunction} from 'UI/Base';
import {IContrastBackground} from 'Controls/interface';

export type TextAlign = 'left' | 'right' | 'center';
export type AutoComplete = 'on' | 'off' | 'username' | 'current-password';

export interface IBaseOptions extends IContrastBackground {
    autoComplete?: AutoComplete;
    textAlign?: TextAlign;
    selectOnClick?: boolean;
    spellCheck?: boolean;
    placeholder?: string | TemplateFunction;
    tooltip?: string;
    name?: string;
    inlineHeight?: string;
    fontSize?: string;
    fontWeight?: string;
    fontColorStyle?: string;
    paste?: (value: string) => void;
}

export interface IBaseFieldTemplate {
    leftFieldTemplate?: TemplateFunction;
    rightFieldTemplate?: TemplateFunction;
}

/**
 * Интерфейс базового поля ввода.
 *
 * @interface Controls/_input/interface/IBase
 * @implements Controls/interface:IContrastBackground
 * @public
 * @author Красильников А.С.
 */
export interface IBase {
    readonly '[Controls/_input/interface/IBase]': boolean;
}

/**
 * @typedef {String} TextAlign
 * @variant left Текст выравнивается по левой стороне.
 * @variant right Текст выравнивается по правой стороне.
 * @variant center Текст выравнивается по центру.
 */
/**
 * @typedef {String} AutoComplete
 * @variant off Отключить автозаполнение.
 * @variant on Включить автозаполнение ранее введенными значениями.
 * @variant username Включить автозаполнение сохраненными именами пользователей.
 * @variant current-password Включить автозаполнение текущими паролями для учетной записи, указанной в поле для имени пользователя.
 */
/**
 * @name Controls/_input/interface/IBase#autoComplete
 * @cfg {AutoComplete} Управление браузерным автозаполнением в поле.
 * @remark
 * Значения для автозаполнения берутся браузером из его хранилища.
 * Имя поля используется для доступа к ним. Поэтому, чтобы значения, хранящиеся в одном поле, не применялись к другому, поля должны иметь разные имена.
 * Для этого мы проксируем имя контрола на нативное поле.
 * Поэтому, если вы включили автозаполнение и не хотите пересечения значений автозаполнения, то укажите имя контрола.
 * Выбирать имя следует на основе области использования поля. Например, для формы регистрации логина и пароля предпочтительно использовать имена login и password.
 * @example
 * В этом примере при щелчке по полю появляется меню браузера с ранее введенными значениями в этом поле.
 * <pre>
 *    <Controls.input:Text autoComplete="on"/>
 * </pre>
 */
/**
 * @name Controls/_input/interface/IBase#textAlign
 * @cfg {TextAlign} Выравнивание текста по горизонтали в поле.
 * @demo Controls-demo/Input/TextAlignments/Index
 */
/**
 * @name Controls/_input/interface/IBase#selectOnClick
 * @cfg {Boolean} Определяет выделение текста после клика по полю.
 * @remark
 * * false - Текст не выделяется.
 * * true - Текст выделяется.
 * @demo Controls-demo/Input/SelectOnClick/Index
 */
/**
 * @name Controls/_input/interface/IBase#spellCheck
 * @cfg {Boolean} Определяет наличие браузерной проверки правописания и грамматики в тексте.
 * @remark
 * * false - Отсутствует проверка правописания и грамматики.
 * * true - Браузер проверяет правописание и грамматику в тексте.
 * @demo Controls-demo/Input/SpellCheck/Index
 */
/**
 * @name Controls/_input/interface/IBase#placeholder
 * @cfg {String|TemplateFunction} Строка или шаблон, содержащие текст подсказки, который будет отображаться в пустом поле.
 * @demo Controls-demo/Input/Placeholders/Index
 */
/**
 * @name Controls/_input/interface/IBaseFieldTemplate#leftFieldTemplate
 * @cfg {String|TemplateFunction} Строка или шаблон, содержащие прикладной контент, который будет отображаться слева от текста в поле ввода.
 * @demo Controls-demo/Input/FieldTemplate/Index
 */
/**
 * @name Controls/_input/interface/IBaseFieldTemplate#rightFieldTemplate
 * @cfg {String|TemplateFunction} Строка или шаблон, содержащие прикладной контент, который будет отображаться справа от текста в поле ввода.
 * @demo Controls-demo/Input/FieldTemplate/Index
 */
/**
 * @name Controls/_input/interface/IBase#tooltip
 * @cfg {String} Текст всплывающей подсказки, отображаемой при наведении указателя мыши на элемент.
 * @remark
 * Подсказка отображает указанный текст, только если введенное значение полностью помещается в поле ввода. Когда значение не помещается полностью, подсказка отображает значение из поля ввода.
 * @demo Controls-demo/Input/Tooltip/Index
 */
/**
 * @name Controls/_input/interface/IBase#paste
 * @function
 * @description Установить выделенное значение равным указанному значению.
 * @param {String} value Значение для замены.
 * @remark
 * Метод используется, когда выделенное значение не известно, а вам требуется заменить его на другое.
 * @demo Controls-demo/Input/Paste/Index
 */

/**
 * @name Controls/_input/interface/IBase#contrastBackground
 * @demo Controls-demo/Input/ContrastBackground/Index
 */
