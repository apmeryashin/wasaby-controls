import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {IColumn} from 'Controls/grid';
import {Text} from '../DataHelpers/Text';

import * as Template from 'wml!Controls-demo/gridNew/MarkerClassName/Text/Text';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _source: Memory;
    protected _columns: IColumn[] = Text.getColumns();
    protected _padding: string[] = ['default', 's', 'l'];
    protected _textSizes: string[] = ['2xl', 'xl', 'l', 'm', 'xs'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._source = new Memory({
            keyProperty: 'key',
            data: Text.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
