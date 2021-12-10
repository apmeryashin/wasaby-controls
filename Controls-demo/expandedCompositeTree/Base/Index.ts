import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/expandedCompositeTree/Base/Base';
import { Memory } from 'Types/source';
import { getData } from 'Controls-demo/expandedCompositeTree/resources/data';
import 'css!Controls-demo/expandedCompositeTree/styles';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _infoData: string = '';

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: getData()
        });
    }

    protected _onItemClick(event, item): void {
        this._infoData = `Click on the item with key === "${ item.getKey() }"`;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
