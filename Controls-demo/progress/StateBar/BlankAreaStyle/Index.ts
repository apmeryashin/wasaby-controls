import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/progress/StateBar/BlankAreaStyle/Template');

class StateBar extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _data: object[];
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    protected _beforeMount(): void {
        this._data = [{
            value: 20
        }];
    }
}

export default StateBar;
