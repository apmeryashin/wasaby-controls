import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Actions/ToolbarWithHistory/Index';
import {Memory} from 'Types/source';
import {overrideOrigSourceMethod, resetHistory} from 'Controls-demo/dropdown_new/Button/HistoryId/Utils';
import {dropdownHistoryUtils} from 'Controls/dropdown';
import {IActionOptions} from 'Controls/actions';
import 'Controls-demo/Actions/ToolbarWithHistory/HistoryAction';

class HeaderContentTemplate extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;
    protected _actions: IActionOptions[] = null;

    protected _beforeMount(): Promise<void> {
        overrideOrigSourceMethod('print', 'id', 'parent@');
        return dropdownHistoryUtils.getSource().then((source) => {
            this._source = source;
            this._actions = [{
                actionName: 'Controls-demo/Actions/ToolbarWithHistory/HistoryAction',
                id: 'prin2t',
                source: this._source
            }, {
                actionName: 'Controls-demo/Actions/ToolbarWithHistory/HistoryAction',
                id: 'print',
                source: this._source,
                showType: 0
            }];
        });
    }

    protected _beforeUnmount(): void {
        resetHistory();
    }
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dropdown_new/Button/Index'];
}
export default HeaderContentTemplate;
