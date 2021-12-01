import {TTileItem} from 'Controls/_tile/display/mixins/TileItem';

/**
 * Миксин, который содержит логику отображения невидимого элемента в коллекции плиток.
 * @author Панихин К.А.
 */
export default abstract class AddingItem {
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    getAddingItemClasses(itemType: TTileItem): string {
        let classes = 'controls-TileView__item_addingTile';
        if (itemType === 'rich') {
            classes += ' controls-TileView__item_addingTile_rich';
        }
        return classes;
    }
}

Object.assign(AddingItem.prototype, {
    '[Controls/_tile/display/mixins/AddingItem]': true
});
