import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls/_themes/ContrastWrapper/ContrastWrapper';

/**
 * Контейнер для контрастной стилизации элементов списка, лежащих на сером фоне
 * @class Controls/_themes/ContrastWrapper
 * @extends UI/Base:Control
 * @author Аверкиев П.А.
 * @public
 * @demo Controls-demo/themes/ContrastWrapper/Index
 */
export default class ContrastWrapper extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _variables: object = {};

    protected _beforeMount(options: IControlOptions): void {
        this._variables = ContrastWrapper._getVariables();
    }

    private static _getVariables(): object {
        return {
            '--label_text-color': '#666',
            '--item_hover_background-color_list': '#E5E7EB',
            '--item_editing_background-color_list': '#D9DBDE',
            '--separator_color': '#EAEAEA',
            '--item_separator_s_color_list': '#EAEAEA',
            '--item_separator_l_color_list': '#EAEAEA',
            '--hover_background-color': '#EBEDF0',
            '--unaccented_active_background-color': '#E3E5E8',
            '--active_background-color': '#E3E5E8',
            '--readonly_color': '#B5B5B5',
            '--pale_border-color': '#DFE2E7',
            '--readonly_border-color': '#DFE2E7',
            '--pale_contrast_background-color': '#E7E9E9',
            '--pale_hover_contrast_background-color': '#DFE2E7',
            '--background-color_scroll_sticky-header': '#F3F5F7'
        };
    }
}
