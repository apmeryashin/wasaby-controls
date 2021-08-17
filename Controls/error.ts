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
    AppHandlerTypes,
    Mode
} from './_error/interface';
import Controller from './_error/Controller';
import process, { IProcessOptions } from './_error/process';
import Popup, { IPopupHelper } from './_error/Popup';
import DialogOpener from './_error/DialogOpener';

export {
    AppHandlerTypes,
    Controller,
    DialogOpener,
    Handler,
    HandlerConfig,
    IPopupHelper,
    IProcessOptions,
    Mode,
    Popup,
    process,
    ViewConfig
};
