import {getWidth} from 'Controls/sizeUtils';
import {detection} from 'Env/Env';
import CounterTemplate = require('wml!Controls/_lookup/SelectedCollection/CounterTemplate');
import {Model} from 'Types/entity';
import {ISelectedCollectionOptions} from 'Controls/_lookup/SelectedCollection';

export = {
    getCounterWidth(itemsCount: number, theme: string, fontSize: string): number {
        return itemsCount && getWidth(CounterTemplate({
            itemsCount,
            theme,
            fontSize
        }));
    },

    getItemMaxWidth(
        indexItem: number,
        itemsLength: number,
        maxVisibleItems: number,
        itemsLayout: string,
        counterWidth: number
    ): string | void {
        let itemMaxWidth;

        if (
            indexItem === 0 &&
            itemsLength > maxVisibleItems && itemsLayout === 'default'
        ) {
            itemMaxWidth = 'calc(100% - ' + counterWidth + 'px);';
        }

        return itemMaxWidth;
    },

    /**
     * В IE flex-end не срабатывает с overflow:hidden, поэтому показываем коллекцию наоборот,
     * чтобы поле в однострочном режиме могло сокращаться при ограниченной ширине
     * @param {number} index идекс элемента
     * @param {number} visibleItemsCount количество видимых записей
     * @param {string} itemsLayout режим отображения коллекции
     * @param {boolean} isStaticCounter признак для определения не фиксированного счетчика
     * @returns {number}
     */
    getItemOrder(index: number, visibleItemsCount: number, itemsLayout: string, isStaticCounter?: boolean): number {
        const collectionReversed = detection.isIE && itemsLayout === 'oneRow';
        if (collectionReversed) {
            // не абсолютный счетчик должен иметь максимальный order, т.к коллекция перевернута
            return isStaticCounter ? visibleItemsCount + 1 : visibleItemsCount - index;
        }
        return index;
    },

    getVisibleItems({items, maxVisibleItems, multiLine, itemsLayout}: Partial<ISelectedCollectionOptions>): Model[] {
        const startIndex = Math.max(maxVisibleItems && multiLine ? items.getCount() - maxVisibleItems : 0, 0);
        const resultItems = [];
        const ignoreMaxVisibleItems = multiLine || itemsLayout === 'twoColumns' || maxVisibleItems === undefined;

        items.each((item, index) => {
            if (index >= startIndex && (index < maxVisibleItems || ignoreMaxVisibleItems)) {
                resultItems.push(item);
            }
        });

        return resultItems;
    }
};
