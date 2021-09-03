import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {INavigation} from 'Controls/interface';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import { generateData } from 'Controls-demo/tileNew/DataHelpers/ForScroll';
import { RecordSet } from 'Types/collection';
import { Memory } from 'Types/source';

import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/ToggleImageVisible/ImagePropertyValueChanged/ImagePropertyValueChanged';

const data = generateData(100);

export default class ImagePropertyValueChanged extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory = null;
    protected _navigation: INavigation;
    protected _fallbackImage: string = `${explorerImages[0]}`;
    private _records: RecordSet;

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data
        });
        this._navigation = {
            source: 'page',
            view: 'infinity',
            sourceConfig: {
                hasMore: false,
                page: 0,
                pageSize: 20
            }
        };
        this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
    }

    protected _itemsReadyCallback(records: RecordSet): void {
        this._records = records;
    }

    protected _onAddImage(): void {
        if (this._records) {
            this._records.at(14).set('image', explorerImages[8]);
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
