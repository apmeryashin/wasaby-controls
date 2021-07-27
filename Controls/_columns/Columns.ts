import {View} from 'Controls/baseList';
import {TemplateFunction} from 'UI/Base';
import {default as ItemContainerGetter} from 'Controls/_columns/itemsStrategy/getItemContainerByIndex';
import {MultiColumnStrategy} from 'Controls/marker';
import {default as Render} from 'Controls/_columns/render/Columns';
import 'css!Controls/columns';

/**
 * Представление списка, которое позволяет расположить записи в нескольких столбцах
 */
export default class Columns extends View { /** @lends Controls/_list/List.prototype */
    protected _viewName: TemplateFunction = Render;
    protected _markerStrategy: new (options) => MultiColumnStrategy = MultiColumnStrategy;
    protected _itemContainerGetter: ItemContainerGetter = ItemContainerGetter;
    protected _plainItemsContainer: boolean = false;

    protected _getModelConstructor(): string {
        return 'Controls/columns:ColumnsCollection';
    }

    static getDefaultOptions(): object {
        return {
            ...super.getDefaultOptions()
        };
    }
}

Object.defineProperty(Columns, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Columns.getDefaultOptions();
    }
});
