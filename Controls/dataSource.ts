/// <amd-module name="Controls/dataSource" />
/**
 * Библиотека компонентов для упрощения загрузки данных: формирования запросов, обработки ошибок.
 * Если нужно обработать ошибки, то вместо этой библиотеки нужно использовать библиотеку {@link Controls/error}.
 * @library
 * @includes error Controls/dataSource:error
 * @includes requestDataUtil Controls/_dataSource/requestDataUtil
 * @public
 * @author Северьянов А.А.
 */
import * as error from 'Controls/_dataSource/error';
import requestDataUtil from 'Controls/_dataSource/requestDataUtil';
import {nodeHistoryUtil} from 'Controls/_dataSource/nodeHistoryUtil';
import groupUtil from 'Controls/_dataSource/GroupUtil';
import {IDataLoaderOptions} from './_dataSource/DataLoader';
import {ILoadDataConfig, ILoadDataResult} from './_dataSource/DataLoader/ListProvider';

export {
    error,
    requestDataUtil,
    ILoadDataConfig as ISourceConfig,
    ILoadDataResult as IRequestDataResult,
    groupUtil,
    nodeHistoryUtil,
    ILoadDataConfig,
    ILoadDataResult,
    IDataLoaderOptions
};
export { CrudWrapper } from 'Controls/_dataSource/CrudWrapper';
export {
    default as NewSourceController,
    IControllerState as ISourceControllerState,
    IControllerOptions as ISourceControllerOptions
} from './_dataSource/Controller';
export {default as calculatePath, Path} from 'Controls/_dataSource/calculatePath';
export {isEqualItems} from './_dataSource/Controller';
export {default as NavigationController} from './_dataSource/NavigationController';
export {ILoadPropertyGridDataConfig} from './_dataSource/DataLoader/PropertyGridProvider';
export {
    ILoadDataCustomConfig
} from './_dataSource/DataLoader/CustomProvider';
export {
    default as DataLoader,
    TLoadersConfigsMap as TLoadConfig,
    TLoadResultMap
} from './_dataSource/DataLoader';
export {default as PageController, IPageConfig} from './_dataSource/PageController';
export {getState as getControllerState, saveState as saveControllerState} from 'Controls/_dataSource/Controller/State';
