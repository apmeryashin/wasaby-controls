import {IProperty} from 'Controls/propertyGrid';
import {object} from 'Types/util';
import {IFilterItem} from 'Controls/filter';
import {isEqual} from 'Types/object';
import {ILoadPropertyGridDataConfig} from 'Controls/dataSource';

export type IPropertyFilterItem = IFilterItem & IProperty;

function isPropertyChanged(property: IPropertyFilterItem): boolean {
    return !isEqual(property.value, property.resetValue);
}

function getFilter(
    property: IPropertyFilterItem,
    filter: Record<string, any>,
    propertyChanged: boolean
): Record<string, any> {
    const resultFilter = filter || {};
    const editorOptions = property.editorOptions;
    if (propertyChanged) {
        resultFilter[editorOptions.keyProperty] = property.value;
    }
    if (editorOptions.historyId) {
        resultFilter.historyIds = [editorOptions.historyId];
    }
    return resultFilter;
}

function prepareDescription(
    description: IPropertyFilterItem[]
): IPropertyFilterItem[] {
    const resultDescription = object.clone(description);
    return resultDescription.map((property) => {
        if (property.type === 'list') {
            const propertyChanged = isPropertyChanged(property);
            property.editorOptions.filter = getFilter(property, property.editorOptions.filter, propertyChanged);
        }
        return property;
    });
}

export default function(
    id: string,
    typeDescription: IPropertyFilterItem[]
): ILoadPropertyGridDataConfig {
    return {
        type: 'propertyGrid',
        typeDescription: prepareDescription(typeDescription),
        id
    };
}
