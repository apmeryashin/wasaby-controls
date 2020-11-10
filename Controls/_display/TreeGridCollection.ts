import TreeGridCollectionItem from 'Controls/_display/TreeGridCollectionItem';
import GridCollection from './GridCollection';
import Tree from './Tree';
import { ItemsFactory } from 'Controls/_display/Collection';

export default class TreeGridCollection<S, T extends TreeGridCollectionItem<S> = TreeGridCollectionItem<S>>
    extends GridCollection<S, T> {

    private _tree: Tree<S, T>;

    constructor(options: any) {
        super(options);
        this._tree = new Tree(options);
    }

    getExpandedItems(): string[] {
        return this._tree.getExpandedItems();
    }

    getRoot(): any {
        return this._tree.getRoot();
    }

    resetExpandedItems(): void {
        return this._tree.resetExpandedItems();
    }

    setHasMoreStorage(): void {
        return this._tree.setHasMoreStorage();
    }

    getChildren(): [] {
        return [];
    }
}

Object.assign(TreeGridCollection.prototype, {
    '[Controls/_display/TreeGridCollection]': true,
    _moduleName: 'Controls/display:TreeGridCollection',
    _itemModule: 'Controls/display:TreeGridCollectionItem'
});
