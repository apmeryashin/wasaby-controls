import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls/_themes/ThemeWrapper/ThemeWrapper';

/**
 * Контейнер для стилизации элементов списка, лежащих на фоне серой темы
 * @class Controls/_themes/ThemeWrapper
 * @extends UI/Base:Control
 * @author Аверкиев П.А.
 * @public
 * @demo Controls-demo/themes/ThemeWrapper/Index
 * @remark Цвет ховера и цвет застиканной записи должны быть вычислены заранее и переданы в опции контрола.
 */
export default class ThemeWrapper extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _variables: object = {};

    protected _beforeMount(options: IControlOptions): void {
        this._variables = ThemeWrapper._getVariables();
    }

    private static _getVariables(): object {
        // По стандарту "Бледная заливка элементов"
        return {
            '--item_hover_background-color_list': '#E5E7EB',
            '--item_editing_background-color_list': '#D9DBDE'
        };
    }
}
