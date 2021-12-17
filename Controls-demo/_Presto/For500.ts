import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/_Presto/For500');
import {getData} from './Data';
import {RecordSet} from 'Types/collection';
import itemTemplate = require('wml!Controls-demo/_Presto/item');

class MyDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _rs: RecordSet;
    protected _itemTemplate: Function = itemTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    protected _beforeMount(): void {
        this._rs = new RecordSet({
            keyProperty: 'key',
            rawData: getData(500)
        });
    }
}
export default MyDemo;
