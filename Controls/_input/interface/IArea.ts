import {TemplateFunction} from 'UI/Base';
import {ITextOptions} from 'Controls/_input/interface/IText';

export interface IAreaOptions extends ITextOptions {
    maxLines?: number;
    minLines?: number;
    value?: string;
    optimizeShadow?: boolean;
    footerTemplate?: string | TemplateFunction;
}

/**
 * Интерфейс многострочного поля ввода.
 * @interface Controls/_input/interface/IArea
 * @public
 * @author Мочалов М.А.
 */

/**
 * @name Controls/_input/interface/IArea#minLines
 * @cfg {Number} Минимальное количество строк.
 * @remark
 * Определяет минимальную высоту поля ввода, при этом в поле может быть введено сколько угодно строк текста.
 * Поддерживается значение от 1 до 10.
 * @see maxLines
 * @default 1
 */

/**
 * @name Controls/_input/interface/IArea#maxLines
 * @cfg {Number} Максимальное количество строк.
 * @remark
 * Определяет максимальную высоту поля ввода, при этом в поле может быть введено сколько угодно строк текста. Если максимальная высота не равна минимальной, то поле ввода тянется по высоте при вводе текста.
 * При вводе текста, превышающего максимальную высоту, в поле ввода появляется скролл.
 * Поддерживается значение от 1 до 10.
 * @see minLines
 */

/**
 * @name Controls/_input/interface/IArea#footerTemplate
 * @cfg {String|TemplateFunction} Строка или шаблон, содержащие контент подвала, который будет отображаться в многострочном поле.
 * @demo Controls-demo/Input/FooterTemplate/Index
 */

/**
 * @name Controls/_input/interface/IArea#optimizeShadow
 * @cfg {Boolean} Включает режим быстрой отрисовки тени.
 * @default true
 * @remark
 * true - Оптимизированные тени.
 * false - Не оптимизированные тени.
 *
 * Отключите оптимизированные тени, если:
 *
 * * У {@link Controls/input:Area} непрозрачный фон.
 * * Controls/input:Area находится в элементе с непрозрачным фоном.
 */
