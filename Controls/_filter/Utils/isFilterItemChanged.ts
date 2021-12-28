import {isEqual} from 'Types/object';
import {IFilterItem} from 'Controls/filter';
import {IoC} from 'Env/Env';

export default function isFilterItemChanged({value, resetValue, visibility}: IFilterItem): boolean {
    const isValueChanged = value !== undefined && !isEqual(value, resetValue);
    const isFilterVisible = visibility === undefined || visibility === true;

    if (isValueChanged && !isFilterVisible) {
        IoC.resolve('ILogger')
            .error('Для элемента фильтра установлено visibility: false при изменённом значении опции value.');
    }

    return isValueChanged && isFilterVisible;
}
