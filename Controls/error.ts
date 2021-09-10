/**
 * Библиотека компонентов для обработки ошибок.
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
    IErrorControllerOptions,
    IDefaultTemplateOptions
} from './_error/interface';
import ErrorController, { IControllerOptions, IProcessConfig, OnProcessCallback } from './_error/Controller';
import process, { IProcessOptions } from './_error/process';
import Popup, { IPopupHelper } from './_error/Popup';
import DialogOpener from './_error/DialogOpener';

// TODO удалить совместимость после перевода всех на новые имена
export {
    DialogOpener,
    ErrorController as Controller, // для совместимости
    ErrorController,
    ErrorHandler as Handler, // для совместимости
    ErrorHandler,
    ErrorType,
    ErrorViewConfig,
    ErrorViewConfig as ViewConfig, // для совместимости
    ErrorViewMode as Mode, // для совместимости
    ErrorViewMode,
    IControllerOptions,
    IDefaultTemplateOptions,
    IErrorControllerOptions,
    IErrorHandlerConfig as HandlerConfig, // для совместимости
    IErrorHandlerConfig,
    IPopupHelper,
    IProcessConfig,
    IProcessOptions,
    OnProcessCallback,
    Popup,
    process
};
