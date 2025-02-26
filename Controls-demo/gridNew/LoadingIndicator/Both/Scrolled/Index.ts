import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/LoadingIndicator/Both/Scrolled/Scrolled';
import {Memory} from 'Types/source';
import {generateData, slowDownSource} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: [] = [{ displayProperty: 'title' }];
    private _dataArray: unknown = generateData({count: 100, entityTemplate: {title: 'lorem'}});

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this._dataArray
        });
        slowDownSource(this._viewSource, 2000);
    }

    protected _afterMount(options?: {}, contexts?: any): void {
        super._afterMount(options, contexts);
        this._children.list.scrollToItem(45);
    }

    protected _onReload(): void {
        this._children.list.reload();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
