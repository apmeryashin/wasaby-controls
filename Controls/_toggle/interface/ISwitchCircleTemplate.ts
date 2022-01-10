/**
 * Шаблон, который используется для отображения иконки для {@link Controls/toggle:RadioGroup radioGroup}.
 * @class Controls/toggle:switchCircleTemplate
 * @author Красильников А.С.
 * @public
 * @see Controls/toggle:RadioGroup
 */

export default interface ISwitchCircleTemplate {

    /**
     * Определяет состояние иконки
     */
    selected?: boolean;

    theme?: string;
    readOnly?: boolean;
}
