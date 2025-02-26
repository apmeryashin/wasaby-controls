import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_actions/SortingActions/MenuItemTemplate');
import {SyntheticEvent} from 'UI/Vdom';
import {Record} from 'Types/entity';

type Order = 'ASC' | 'DESC';

export default class MenuItemTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _arrowClick(e: SyntheticEvent<Event>, item: Record): void {
        e.stopPropagation();
        const newValue = MenuItemTemplate._getOppositeOrder(item.get('value') || 'ASC');
        item.set('value', newValue);
    }

    protected static _getOppositeOrder = (order: Order) => {
        if (order === 'DESC' || !order) {
            return 'ASC';
        }
        return 'DESC';
    }
}
