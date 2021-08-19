/**
 * Библиотека компонентов для обработки ошибок.
 * Вместо этой библиотеки следует использовать библиотеку {@link Controls/dataSource:error}.
 * @library
 * @includes IProcess Controls/_error/
 * @public
 * @author Северьянов А.А.
 */

import {
    Handler,
    ViewConfig,
    HandlerConfig,
    DefaultErrorTypes,
    Mode
} from './_error/interface';
import Controller from './_error/Controller';
import process, { IProcessOptions } from './_error/process';
import Popup, { IPopupHelper } from './_error/Popup';
import DialogOpener from './_error/DialogOpener';

export {
    DefaultErrorTypes,
    Controller,
    Controller as ErrorController,
    DialogOpener,
    Handler,
    Handler as ErrorHandler,
    HandlerConfig,
    HandlerConfig as IErrorHandlerConfig,
    IPopupHelper,
    IProcessOptions,
    Mode,
    Mode as ErrorDisplayMode,
    Popup,
    process,
    ViewConfig,
    ViewConfig as IErrorViewConfig
};
