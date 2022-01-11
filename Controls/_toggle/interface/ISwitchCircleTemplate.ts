import {IControlOptions} from 'UI/Base';

/**
 * Шаблон, который используется для отображения иконки для {@link Controls/toggle:RadioGroup radioGroup}.
 * @class Controls/toggle:switchCircleTemplate
 * @author Красильников А.С.
 * @public
 * @see Controls/toggle:RadioGroup
 */

export default interface ISwitchCircleTemplate extends IControlOptions {

    /**
     * Определяет состояние иконки
     */
    selected?: boolean;
}
