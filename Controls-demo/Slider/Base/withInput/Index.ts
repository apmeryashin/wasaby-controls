import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Slider/Base/withInput/Template');
import 'css!Controls-demo/Controls-demo';

class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: number = 10;

    protected _changedHandler(event: Event, value: string): void {
        const resValue = Number(value);
        if (resValue <= 0) {
            this._value = 0;
        } else if (resValue > 100) {
            this._value = 100;
        } else {
            this._value = resValue;
        }
    }
}

export default Demo;