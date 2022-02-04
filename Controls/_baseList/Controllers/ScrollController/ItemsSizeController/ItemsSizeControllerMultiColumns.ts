import {ItemsSizeController} from './ItemsSizeController';
import {IItemsRange} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

export default class ItemsSizeControllerMultiColumns extends ItemsSizeController {
    protected _updateItemsSizes(itemsRange: IItemsRange, itemsElements: Element[]): void {
        let position = itemsRange.startIndex;

        // Нужно учитывать оффсет элементов скрытых виртуальным диапазоном.
        // Например, был диапазон 0 - 10, стал 5 - 15
        // У 5-ой записи offset === 0, но перед ней есть еще 5-ть скрытых записей, у которых мы знаем offset.
        // offset после последней скрытой записи равен ее offset + size.
        let hiddenItemsOffset = 0;
        if (position > 0) {
            const firstItemOffset = this._itemsSizes[0].offset;
            const lastHiddenItem = this._itemsSizes[position - 1];
            // нужно вычитать оффсет первой записи, чтобы он не учитывался дважды, когда мы будем прибавлять
            // hiddenItemsOffset к элементам нового диапазона.
            // Иначе будет дважды посчитана высота ромашки или хедера.
            hiddenItemsOffset = lastHiddenItem.offset + lastHiddenItem.size - firstItemOffset;
        }
        itemsElements.forEach((element: HTMLElement) => {
            const offset = element.getBoundingClientRect().top - this._itemsContainer.getBoundingClientRect().top;
            this._itemsSizes[position] = {
                size: this._getItemSize(element),
                offset: offset + hiddenItemsOffset,
                key: element.getAttribute('item-key')
            };
            position++;
        });

        // Т.к. мы обновили размеры в начале массива, то у последующих элементов нужно обновить offset
        if (itemsRange.endIndex > 0 && itemsRange.endIndex < this._itemsSizes.length) {
            const lastUpdatedItem = this._itemsSizes[itemsRange.endIndex - 1];
            const firstNotUpdatedItem = this._itemsSizes[itemsRange.endIndex];
            const updatedItemsOffset = lastUpdatedItem.offset + lastUpdatedItem.size
                - firstNotUpdatedItem.offset;
            for (let i = itemsRange.endIndex; i < this._itemsSizes.length; i++) {
                this._itemsSizes[i].offset += updatedItemsOffset;
            }
        }
    }
}
