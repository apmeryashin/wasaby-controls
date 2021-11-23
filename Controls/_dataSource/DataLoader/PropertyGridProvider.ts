import {IDataLoadProvider, IBaseLoadDataConfig} from 'Controls/_dataSource/DataLoader/IDataLoadProvider';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {IProperty} from 'Controls/propertyGrid';

export interface ILoadPropertyGridDataConfig extends IBaseLoadDataConfig {
    id?: string;
    type?: 'propertyGrid';
    typeDescription: IProperty[];
}

const LOAD_DATA_TIMEOUT = 5000;

/**
 * Provider обеспечивающих предзагрузку данных для propertyGrid'a
 */
class PropertyGridProvider implements IDataLoadProvider<ILoadPropertyGridDataConfig, IProperty[]> {
    load(
        loadConfig: ILoadPropertyGridDataConfig,
        loadDataTimeout: number = LOAD_DATA_TIMEOUT
    ): Promise<IProperty[]> {
        const loadPromises = this._getLoadPromisesFromDescription(loadConfig.typeDescription);
        const loadPromise = Promise.all(loadPromises);
        return wrapTimeout(
            loadPromise,
            loadDataTimeout
        ).catch((error) => error);
    }

    private _getLoadPromisesFromDescription(description: IProperty[]): Array<Promise<IProperty>> {
        const loadPromises = [];
        description.forEach((property: IProperty) => {
            if (property.type && property.type === 'list') {
                loadPromises.push(this._loadList(property));
            } else if (property.type === 'propertyGrid') {
                loadPromises.push(this.load({
                    typeDescription: property.editorOptions.typeDescription
                }).then((propertyGridDescription) => {
                    property.editorOptions.typeDescription = propertyGridDescription;
                    return property;
                }));
            }
        });
        return loadPromises;
    }

    private _loadList(property: IProperty): Promise<IProperty> {
        return import('Controls/dataSource').then(({NewSourceController}) => {
            return new NewSourceController({
                source: property.editorOptions.source,
                filter: property.editorOptions.filter,
                keyProperty: property.editorOptions.keyProperty,
                navigation: property.editorOptions.navigation,
                parentProperty: property.editorOptions.parentProperty,
                expandedItems: property.editorOptions.expandedItems
            }).load().then((loadResult) => {
                property.editorOptions.items = loadResult;
                return property;
            });
        });
    }
}

export default PropertyGridProvider;
