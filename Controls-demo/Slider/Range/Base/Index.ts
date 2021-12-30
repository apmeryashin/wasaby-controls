import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Slider/Range/Base/Template');
import 'css!Controls-demo/Controls-demo';

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _startValue: number;
    protected _endValue: number;

    protected _beforeMount(): void {
        this._startValue = 40;
        this._endValue = 60;
    }
    protected _changedStartHandler(event: Event, value: string): void {
        const resValue = Number(value);
        if (resValue >= this._endValue) {
            this._startValue = this._endValue;
        } else if (resValue <= 0) {
            this._startValue = 0;
        } else if (resValue > 100) {
            this._startValue = 100;
        } else {
            this._startValue = resValue;
        }
    }

    protected _changedEndHandler(event: Event, value: string): void {
        const resValue = Number(value);
        if (resValue <= this._startValue) {
            this._endValue = this._startValue;
        } else if (resValue <= 0) {
            this._endValue = 0;
        } else if (resValue > 100) {
            this._endValue = 100;
        } else {
            this._endValue = resValue;
        }
    }
}

export default Base;
