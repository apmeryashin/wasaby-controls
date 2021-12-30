import { mixin } from 'Types/util';
import CollectionItem from './CollectionItem';
import { MODULE_NAME } from './CompositeCollectionItem';
import CompositeItem from './strategy/CompositeItem';
import { Tree, ITreeCollectionOptions } from 'Controls/display';
import { Model } from 'Types/entity';
import { ITreeTileCollectionOptions } from 'Controls/_treeTile/display/TreeTileCollection';
import { TemplateFunction } from 'UI/Base';

export interface ICompositeViewConfig extends ITreeTileCollectionOptions {
    compositeNodesLevel: number;
    itemTemplate: TemplateFunction|string;
    itemTemplateOptions: Object;
}

export interface IOptions<S extends Model, T extends CollectionItem<S>>
   extends ITreeCollectionOptions<S, T> {
    compositeViewConfig: ICompositeViewConfig;
}

export default class Collection<
    S extends Model,
    T extends CollectionItem<S> = CollectionItem<S>
> extends mixin<Tree<Model>>(Tree) {
    readonly '[Controls/expandedCompositeTree:Collection]': boolean;
    protected _$compositeViewConfig: ICompositeViewConfig;
    protected _$compositeNodesLevel: number;

    constructor(options: IOptions<S, T>) {
        super(options);

        const compositeNodesLevel = this._$compositeNodesLevel;

        this.appendStrategy(CompositeItem, {});
        this.addFilter(
            (contents, sourceIndex, item, collectionIndex) =>
                (item.isNode() && item.getLevel() < compositeNodesLevel) || item[`[${ MODULE_NAME }]`]
        );
    }

    getCompositeViewConfig(): ICompositeViewConfig {
        return this._$compositeViewConfig;
    }
}

Object.assign(Collection.prototype, {
    '[Controls/expandedCompositeTree:Collection]': true,
    _moduleName: 'Controls/expandedCompositeTree:Collection',
    _itemModule: 'Controls/expandedCompositeTree:CollectionItem',
    _$compositeViewConfig: null,
    _$compositeNodesLevel: null
});
