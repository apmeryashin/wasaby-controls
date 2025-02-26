import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls/_toggle/Checkbox/resources/CheckboxMarker');
import 'css!Controls/toggle';

export interface ICheckboxMarkerOptions extends IControlOptions {
    triState?: boolean;
    value?: boolean | null;
    horizontalPadding?: string;
    checkboxStyle?: 'default' | 'primary';
    size?: 's' | 'l';
}
/**
 * Контрол, отображающий элемент контрола "чекбокс" - галочку
 * @remark
 * Контрол служит только для отображения галочки, он не реагирует на какие-либо события и сам не стреляет событиями
 * @class Controls/_toggle/CheckboxMarker
 * @extends UI/Base:Control
 *
 * @public
 * @author Мочалов М.А.
 * @demo Controls-demo/toggle/CheckboxMarker/Index
 */

class CheckboxMarker extends Control<ICheckboxMarkerOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static defaultProps: ICheckboxMarkerOptions = {
        horizontalPadding: 'default',
        checkboxStyle: 'primary',
        size: 's'
    };
}

/**
 * @name Controls/_toggle/CheckboxMarker#horizontalPadding
 * @cfg {String} Конфигурация горизонтальных отступов чекбокса.
 * @default default
 * @variant default
 * @variant null
 * @demo Controls-demo/toggle/CheckboxMarker/HorizontalPadding/Index
 */
/**
 * @name Controls/_toggle/CheckboxMarker#triState
 * @cfg {Boolean} Определяет, разрешено ли устанавливать чекбоксу третье состояние — "не определен" (null).
 * @default False
 * @remark
 * * True - Разрешено устанавливать третье состояние.
 * * False - Не разрешено устанавливать третье состояние.
 *
 * Если установлен режим triState, то значение {@link value} может быть "null".
 */
/**
 * @name Controls/_toggle/CheckboxMarker#value
 * @cfg {Boolean|null} Значение, которое определяет текущее состояние.
 * @default False
 * @remark
 * * True - чекбокс в состоянии "отмечено".
 * * False - чекбокс в состоянии "не отмечено". Это состояние по умолчанию.
 * * null - состояние чекбокса при включенной опции {@link triState}.
 */

/**
 * @name Controls/_toggle/CheckboxMarker#checkboxStyle
 * @cfg {String} Цвет заливки чекбокса.
 * Внимание: опция работает только в паре с опцией {@link contrastBackground}
 * @variant primary
 * @variant default
 * @default primary
 */

/**
 * @name Controls/_toggle/CheckboxMarker#size
 * @cfg {String} Определяет размер галочки.
 * @variant s
 * @variant l
 * @default s
 */
export default CheckboxMarker;
