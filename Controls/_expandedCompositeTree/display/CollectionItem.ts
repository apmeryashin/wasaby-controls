import { mixin } from 'Types/util';
import { TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';

export const MODULE_NAME = 'Controls/expandedCompositeTree:CollectionItem';

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

    readonly listInstanceName: string = 'controls-ExpandedCompositeTree';
    readonly listElementName: string = 'item';

    getTreeWrapperClasses(): string {
        return '';
    }
}

Object.assign(CollectionItem.prototype, {
    '[Controls/expandedCompositeTree:CollectionItem]': true,
    '[Controls/_display/TreeItem]': true,
    _moduleName: MODULE_NAME,
    _$searchValue: '',
    _instancePrefix: 'ect-item-',
    _$hasStickyGroup: false
});
