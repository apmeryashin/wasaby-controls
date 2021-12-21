import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/expandedCompositeTree/Base/Base';
import * as CompositeItemTemplate from 'wml!Controls-demo/expandedCompositeTree/Base/CompositeItemTemplate';
import * as ItemTemplate from 'wml!Controls-demo/expandedCompositeTree/Base/ItemTemplate';
import { DataSet, Memory, Query } from 'Types/source';
import { getData } from 'Controls-demo/expandedCompositeTree/resources/data';
import 'css!Controls-demo/expandedCompositeTree/styles';
import { Model } from 'Types/entity';
import { TKey } from 'Controls/interface';
import { DetailViewMode } from 'Controls/newBrowser';

class ExtMemory extends Memory {
    query(query?: Query): Promise<DataSet> {
        query.where(null);
        return super.query(query);
    }
}

const COMPOSITE_VIEW_CONFIG = {
    keyProperty: 'key',
    parentProperty: 'parent',
    nodeProperty: 'type',
    itemPadding: {
        top: 's',
        bottom: 's'
    },
    roundBorder: {
        tr: 's',
        tl: 's',
        br: 's',
        bl: 's'
    },
    imageProperty: 'image',
    tileMode: 'static',
    tileWidth: 320,
    tileScalingMode: 'none',
    displayProperty: 'caption',
    itemTemplate: CompositeItemTemplate
};

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: ExtMemory;
    protected _infoData: string = '';
    protected _activeElement: TKey = null;
    protected _detailConfig: {} = {
        itemPadding: {
            left: 'null',
            right: 'null',
            top: 'l',
            bottom: 'l'
        },
        itemTemplate: ItemTemplate,
        compositeViewConfig: COMPOSITE_VIEW_CONFIG
    };
    protected _masterConfig: {} = {
        masterVisibility: 'hidden'
    };
    protected _listConfiguration: {} = {
        settings: {
            access: 'global',
            accountViewMode: DetailViewMode.list,
            clientViewMode: DetailViewMode.list
        },
        list: {
            list: {
            },
            node: {
                position: 'composite'
            },
            leaf: {
            }
        },
        tile: {
            node: {
                position: 'composite'
            },
            leaf: {
            }
        },
        table: {
            node: {
                position: 'composite'
            },
            leaf: {
            }
        }
    };

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
