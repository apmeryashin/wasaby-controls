import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/_Presto/List500');
import {Memory} from 'Types/source';
import {getData} from './Data';

class MyDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _viewSource: Memory;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: getData(500)
        });
    }
}
export default MyDemo;
