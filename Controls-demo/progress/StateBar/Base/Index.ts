import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/progress/StateBar/Base/Template');

class StateBar extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _data0: object[];
    protected _data1: object[];
    protected _data60: object[];
    protected _data60default: object[];
    protected _data100: object[];
    protected _data2040: object[];
    protected _data103040: object[];
    protected _data104050: object[];
    protected _data407050: object[];
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    protected _beforeMount(): void {
        this._data0 = [{
            value: 0,
            title: 'Положительно'
        }];
        this._data1 = [{
            value: 1,
            title: 'Положительно'
        }];
        this._data60default = [{
            value: 60
        }];
        this._data60 = [{
            value: 60,
            title: 'Положительно',
            style: 'success'
        }];
        this._data100 = [{
            value: 100,
            title: 'Положительно',
            style: 'success'
        }];
        this._data2040 = [{
            value: 20,
            title: 'Положительно',
            style: 'success'
        }, {
            value: 40,
            title: 'Отрицательно',
            style: 'danger'
        }];
        this._data103040 = [{
            value: 10,
            title: 'Положительно',
            style: 'success'
        }, {
            value: 30,
            title: 'В работе',
            style: 'warning'
        }, {
            value: 40,
            title: 'Отрицательно',
            style: 'danger'
        }];
        this._data104050 = [{
            value: 10,
            title: 'Положительно',
            style: 'success'
        }, {
            value: 40,
            title: 'В работе',
            style: 'warning'
        }, {
            value: 50,
            title: 'Отрицательно',
            style: 'danger'
        }];
    }
}

export default StateBar;