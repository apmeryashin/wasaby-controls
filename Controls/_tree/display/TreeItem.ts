import { mixin } from 'Types/util';
import { ITreeItemOptions, TreeItem as DisplayTreeItem } from 'Controls/display';
import TreeCollection from './TreeCollection';
import { Model } from 'Types/entity';

export interface IOptions<T extends Model> extends ITreeItemOptions<T> {
    owner: TreeCollection<T>;
}

export default class TreeItem<T extends Model = Model>
    extends mixin<DisplayTreeItem<any>>(DisplayTreeItem) {

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;
    readonly DisplayItemActions: boolean = true;
    readonly DisplaySearchValue: boolean = true;
    readonly Markable: boolean = true;
    readonly SelectableItem: boolean = true;
    readonly EnumerableItem: boolean = true;
    readonly EdgeRowSeparatorItem: boolean = true;
    readonly DraggableItem: boolean = true;

    readonly listInstanceName: string =  'controls-Tree__item';

    // region Classes
    getTreeWrapperClasses(): string {
        let classes = 'controls-Tree__itemContentTreeWrapper';
        classes += super._getLeftSpacingContentClasses();
        return classes;
    }

    protected _getLeftSpacingContentClasses(): string {
        return '';
    }
    // endregion Classes
}

Object.assign(TreeItem.prototype, {
    '[Controls/tree:TreeItem]': true,
    '[Controls/_display/TreeItem]': true,
    _moduleName: 'Controls/tree:TreeItem',
    _$searchValue: '',
    _instancePrefix: 'tree-item-',
    _$hasStickyGroup: false
});
