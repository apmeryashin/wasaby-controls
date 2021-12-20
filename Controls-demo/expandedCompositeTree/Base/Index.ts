import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/expandedCompositeTree/Base/Base';
import { DataSet, Memory, Query } from 'Types/source';
import { getData } from 'Controls-demo/expandedCompositeTree/resources/data';
import 'css!Controls-demo/expandedCompositeTree/styles';
import { Model } from 'Types/entity';
import { TKey } from 'Controls/interface';

class ExtMemory extends Memory {
    query(query?: Query): Promise<DataSet> {
        query.where(null);
        return super.query(query);
    }
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: ExtMemory;
    protected _infoData: string = '';
    protected _activeElement: TKey = null;

    protected _beforeMount(): void {
        this._viewSource = new ExtMemory({
            keyProperty: 'key',
            data: getData()
        });
    }

    protected _onItemClick(event: unknown, item: Model): void {
        this._infoData = `Click on the item with key === "${ item.getKey() }"`;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
