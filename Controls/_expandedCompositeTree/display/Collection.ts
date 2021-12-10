import { mixin } from 'Types/util';
import CollectionItem from './CollectionItem';
import { MODULE_NAME } from './CompositeCollectionItem';
import CompositeItem from './strategy/CompositeItem';
import { Tree, ITreeCollectionOptions } from 'Controls/display';
import { Model } from 'Types/entity';

const COMPOSITE_LEVEL = 3; // todo add option for replace this const

export interface ICompositeViewConfig {
    itemTemplate: string;
    // todo release interface
}

export interface IOptions<S extends Model, T extends CollectionItem<S>>
   extends ITreeCollectionOptions<S, T> {
    nodeTypeProperty?: string;
    compositeViewConfig: ICompositeViewConfig;
}

export default class Collection<
    S extends Model,
    T extends CollectionItem<S> = CollectionItem<S>
> extends mixin<Tree<Model>>(Tree) {
    readonly '[Controls/expandedCompositeTree:Collection]': boolean;
    protected _$compositeViewConfig: ICompositeViewConfig;

    constructor(options: IOptions<S, T>) {
        super(options);

        this.appendStrategy(CompositeItem, {});
        this.addFilter(
            (contents, sourceIndex, item, collectionIndex) =>
                (item.isNode() && item.getLevel() < COMPOSITE_LEVEL) || item[`[${ MODULE_NAME }]`]
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
    _$compositeViewConfig: null
});
