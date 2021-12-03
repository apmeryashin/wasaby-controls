import {IMaxLengthOptions} from 'Controls/_input/interface/IMaxLength';

export interface ITextOptions extends IMaxLengthOptions {
    constraint?: string | RegExp;
    convertPunycode: boolean;
    trim: boolean;
    transliterate?: boolean;
}

/**
 * Интерфейс текстового поля ввода.
 *
 * @interface Controls/_input/interface/IText
 * @implements Controls/input:IMaxLength
 * @public
 * @author Красильников А.С.
 */
export interface IText {
    readonly '[Controls/_input/interface/IText]': boolean;
}

/**
 * @name Controls/_input/interface/IText#constraint
 * @cfg {String} Фильтр вводимого значения в формате регулярного выражение {@link https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Regular_Expressions#special-character-set [xyz]}.
 * @remark
 * Каждый, введенный символ пользователем, фильтруется отдельно. Символ не прошедший фильтрацию в поле не добавляется.
 * Например, пользователь вставляет "1ab2cd" в поле с ограничением "[0-9]". Будет вставлено "12".
 * @demo Controls-demo/Input/Constraint/Index
 */
/**
 * @name Controls/_input/interface/IText#convertPunycode
 * @cfg {Boolean} Нужно ли преобразовывать вводимое значения из Punycode в Unicode.
 * @remark
 * @demo Controls-demo/Input/ConvertPunycode/Index
 */
/**
 * @name Controls/_input/interface/IText#trim
 * @cfg {Boolean} Определяет наличие пробельных символов в начале и конце значения, после завершения ввода.
 * @remark
 * * false - Пробельные символы сохраняются.
 * * true - Пробельные символы удаляются.
 * @demo Controls-demo/Input/Trim/Index
 * @default true
 */
/**
 * @name Controls/_input/interface/IText#transliterate
 * @cfg {Boolean} Определяет включена ли транслитерация на сочетание клавиш Alt+t или PauseBreak.
 * @default true
 * @demo Controls-demo/Input/Text/Transliterate/Index
 */
/**
 * @name Controls/_input/interface/IText#contrastBackground
 * @cfg {Boolean}
 * @demo Controls-demo/Input/Text/ContrastBackground/Index
 */
