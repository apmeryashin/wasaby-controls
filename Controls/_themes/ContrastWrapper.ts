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
            '--item_hover_background-color_list': '#E5E7EB',
            '--item_editing_background-color_list': '#D9DBDE'
        };
    }
}