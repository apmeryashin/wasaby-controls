import {IItemAction, TItemActionShowType} from '../interface/IItemAction';
import { IShownItemAction } from '../interface/IItemActionsObject';

/**
 * Утилиты для измерения опций свайпа, которые нужно показать на странице
 */
export class MeasurerUtils {
    /**
     * Возвращает набор опций свайпа, которые нужно показать на странице.
     * Фильтрует все элементы, у которых нет родителя и сортирует их по TItemActionShowType
     * @param actions
     */
    static getActualActions(actions: IShownItemAction[]): IShownItemAction[] {
        const itemActions = actions.filter((action) => !action.parent);
        itemActions.sort((action1: IShownItemAction, action2: IShownItemAction) => (
            (action2.showType || TItemActionShowType.MENU) - (action1.showType || TItemActionShowType.MENU)
        ));
        return itemActions;
    }

    /**
     * Перемещает FIXED опервции над записью в конец массива.
     * @param itemActions
     * @param sliceLength
     */
    static resortFixedActions(itemActions: IItemAction[], sliceLength?: number): IShownItemAction[] {
        const fixedActions = itemActions.filter((action) => action.showType === TItemActionShowType.FIXED);
        const shownActions = itemActions.slice(fixedActions.length, sliceLength);
        return shownActions.concat(fixedActions);
    }
}
