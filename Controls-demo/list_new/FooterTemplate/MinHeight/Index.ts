import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {Control, TemplateFunction} from 'UI/Base';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';
import * as Template from 'wml!Controls-demo/list_new/FooterTemplate/MinHeight/Index';
import 'css!Controls-demo/list_new/FooterTemplate/MinHeight/Index';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _items: RecordSet;
    protected _footerContent: string = 'show';

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: getData()
        });

        this._items = new RecordSet({
            rawData: [
                {
                    id: 'show',
                    caption: 'В футере есть контент'
                },
                {
                    id: 'hide',
                    caption: 'В футере нет контента'
                }
            ],
            keyProperty: 'id'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
