import { mixin } from 'Types/util';
import { TreeItem, Collection } from 'Controls/display';
import { Model } from 'Types/entity';
import { TileCollection } from 'Controls/tile';
import * as CompositeItemTemplate from 'wml!Controls/_expandedCompositeTree/render/CompositeItemTemplate';

import { TileView } from 'Controls/tile';
import { ITreeItemOptions } from 'Controls/tree';
import { TemplateFunction } from 'UI/Base';
import { ObservableList } from 'Types/collection';
import type { ICompositeViewConfig } from './Collection';

export const MODULE_NAME = 'Controls/expandedCompositeTree:CompositeCollectionItem';

interface ICompositeCollectionItemOptions extends ITreeItemOptions<Model> {
    compositeViewConfig: ICompositeViewConfig;
}

export default class CollectionItem<T extends Model = Model>
    extends mixin<TreeItem<Model>>(TreeItem) {

    readonly EditableItem: boolean = true;
    readonly DisplayItemActions: boolean = true;
    readonly DisplaySearchValue: boolean = false;
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = true;
    readonly EdgeRowSeparatorItem: boolean = false;
    readonly DraggableItem: boolean = false;

    readonly listInstanceName: string =  'controls-ExpandedCompositeTree';
    readonly listElementName: string = 'composite-item';

    protected _renderCollection: Collection;
    protected _$compositeViewConfig: ICompositeViewConfig;

    constructor(options: ICompositeCollectionItemOptions) {
        super(options);

        this._initializeCollection(options.list);
    }

    getList(): ObservableList<Model> {
        return this._renderCollection.getCollection() as ObservableList<Model>;
    }

    private _initializeCollection(list) {
        this._renderCollection = new TileCollection({
            ...this._$compositeViewConfig,
            collection: list
        });
    }

    getTreeWrapperClasses(): string {
        return '';
    }

    getTemplate(): TemplateFunction|string {
        return CompositeItemTemplate;
    }

    getRenderTemplate(): Function {
        return TileView;
    }

    getRenderParams(): {} {
        return {
            itemTemplate: this._$compositeViewConfig.itemTemplate,
            listModel: this._renderCollection
        };
    }
}

Object.assign(CollectionItem.prototype, {
    '[Controls/expandedCompositeTree:CompositeCollectionItem]': true,
    '[Controls/_display/TreeItem]': true,
    _moduleName: MODULE_NAME,
    _$searchValue: '',
    _instancePrefix: 'ect-composite-item-',
    _$hasStickyGroup: false,
    _$compositeViewConfig: null
});
