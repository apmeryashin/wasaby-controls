/**
 * Библиотека компонентов для обработки ошибок.
 * Вместо этой библиотеки следует использовать библиотеку {@link Controls/dataSource:error}.
 * @library
 * @includes IProcess Controls/_error/
 * @public
 * @author Северьянов А.А.
 */

import {
    ErrorHandler,
    ErrorViewConfig,
    IErrorHandlerConfig,
    ErrorType,
    ErrorViewMode,
    IErrorControllerOptions
} from './_error/interface';
import ErrorController from './_error/Controller';
import process, { IProcessOptions } from './_error/process';
import Popup, { IPopupHelper } from './_error/Popup';
import DialogOpener from './_error/DialogOpener';

// TODO удалить совместимость после перевода всех на новые имена
export {
    ErrorType,
    ErrorController,
    ErrorController as Controller, // для совместимости
    DialogOpener,
    ErrorHandler,
    ErrorHandler as Handler, // для совместимости
    IErrorControllerOptions,
    IErrorHandlerConfig,
    IErrorHandlerConfig as HandlerConfig, // для совместимости
    IPopupHelper,
    IProcessOptions,
    ErrorViewMode,
    ErrorViewMode as Mode, // для совместимости
    Popup,
    process,
    ErrorViewConfig as ViewConfig, // для совместимости
    ErrorViewConfig
};
