import {TTileItem} from 'Controls/_tile/display/mixins/TileItem';

/**
 * Миксин, который содержит логику отображения плитки добавления в коллекции плиток.
 * @author Колесов В.А.
 */
export default abstract class AddItem {
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    getAddItemClasses(itemType: TTileItem): string {
        let classes = 'controls-TileView__item_addTile';
        if (itemType === 'rich') {
            classes += ' controls-TileView__item_addTile_rich';
        }
        return classes;
    }
}

Object.assign(AddItem.prototype, {
    '[Controls/_tile/display/mixins/AddItem]': true
});
