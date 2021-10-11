import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';

import {getGroupedCatalog as getData} from '../../DemoHelpers/Data/Groups';

import * as Template from 'wml!Controls-demo/list_new/Grouped/Nested/Nested';

const rootData = [
    {
        key: 1,
        store: 'ПК и техника'
    }
];

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _rootSource: Memory;
    protected _nestedSource: Memory;

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._rootSource = new Memory({
            keyProperty: 'key',
            data: rootData
        });
        this._nestedSource = new Memory({
            keyProperty: 'key',
            data: getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
