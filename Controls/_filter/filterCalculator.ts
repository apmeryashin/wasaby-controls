import {IFilterItem} from 'Controls/filter';

export default function getFilterByFilterDescription(filter: object, filterDescription: IFilterItem[] = []): object {
    const resultFilter = {...filter};

    filterDescription.forEach(({name, id, value, visibility, viewMode}) => {
        const filterName = name || id;
        if (value !== undefined && ((visibility === undefined || visibility === true) || viewMode === 'frequent')) {
            resultFilter[filterName] = value;
        } else {
            delete resultFilter[filterName];
        }
    });

    return resultFilter;
}
