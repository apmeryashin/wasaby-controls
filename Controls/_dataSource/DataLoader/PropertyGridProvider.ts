import {IDataLoadProvider, IBaseLoadDataConfig} from 'Controls/_dataSource/DataLoader/IDataLoadProvider';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {IProperty} from 'Controls/propertyGrid';
import ListProvider from 'Controls/_dataSource/DataLoader/ListProvider';

export interface ILoadPropertyGridDataConfig extends IBaseLoadDataConfig {
    id?: string;
    type?: 'propertyGrid';
    typeDescription: IProperty[];
}

/**
 * Provider обеспечивающих предзагрузку данных для propertyGrid'a
 */
class PropertyGridProvider implements IDataLoadProvider<ILoadPropertyGridDataConfig, IProperty[]> {
    load(
        loadConfig: ILoadPropertyGridDataConfig,
        loadDataTimeout?: number
    ): Promise<IProperty[]> {
        const loadPromises = this._getLoadPromisesFromDescription(loadConfig.typeDescription);
        const loadPromise = Promise.all(loadPromises);
        return wrapTimeout(
            loadPromise,
            loadDataTimeout
        ).catch((error) => error);
    }

    private _getLoadPromisesFromDescription(description: IProperty[]): any {
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
        return new ListProvider().load(property.editorOptions).then((loadResult) => {
            property.editorOptions.sourceController = loadResult.sourceController;
            return property;
        });
    }
}

export default PropertyGridProvider;
