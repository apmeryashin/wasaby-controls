import { Logger } from 'UI/Utils';
import { PromiseCanceledError } from 'Types/entity';
import { constants } from 'Env/Env';
import { loadAsync } from 'WasabyLoader/ModulesLoader';
import { fetch } from 'Browser/Transport';
import {
    Handler,
    HandlerConfig,
    ProcessedError,
    ViewConfig,
    Mode,
    CanceledError
} from './interface';
import Popup, { IPopupHelper } from './Popup';

/**
 * Параметры конструктора контроллера ошибок.
 * @public
 */
export interface IControllerOptions {
    /**
     * Пользовательские обработчики ошибок.
     */
    handlers?: Handler[];

    /**
     * @cfg {Controls/error:ViewConfig} Эта функция будет вызвана во время обработки ошибки.
     * Она возвращает конфигурацию для отображения ошибки.
     * Эта конфигурация объединится с той, которую вернёт обработчик ошибки.
     */
    onProcess?: onProcessCallback;
}

export type onProcessCallback = (viewConfig: ViewConfig) => (ViewConfig | PromiseCanceledError);
type RawHandler = Handler | string;

let popupHelper: IPopupHelper;

/**
 * Получить экземпляр IPopupHelper, который контроллер ошибок использует по умолчанию, если ему не передали другого.
 * @private
 */
export function getPopupHelper(): IPopupHelper {
    if (!popupHelper) {
        popupHelper = new Popup();
    }

    return popupHelper;
}

class HandlerIterator {
    lastHandler: Handler;

    // Загружает обработчик
    private get(handler: RawHandler): Promise<Handler> {
        return typeof handler === 'string'
            ? loadAsync(handler)
            : typeof handler === 'function'
                ? Promise.resolve(handler)
                : Promise.reject(new Error('handler must be string|function'));
    }

    // Выполнить функцию и вернуть Promise со значением, которое вернула функция.
    private call(fn: Handler, arg: HandlerConfig): Promise<ReturnType<Handler>> {
        return new Promise((resolve, reject) => {
            try {
                resolve(fn(arg));
            } catch (error) {
                reject(error);
            }
        });
    }

    // Выполнять по очереди обработчики ошибок, пока какой-нибудь из них не вернёт результат.
    getViewConfig([handler, ...restHandlers]: RawHandler[], config: HandlerConfig): Promise<ViewConfig | void> {
        if (!handler) {
            return Promise.resolve();
        }

        return this.get(handler)
            .catch((error: Error) => {
                // Не удалось получить функцию-обработчик.
                // Логируем ошибку и продолжаем выполнение обработчиков.
                Logger.error('Invalid error handler', null, error);
            })
            .then((handlerFn: Handler) => {
                this.lastHandler = handlerFn;
                return this.call(handlerFn, config);
            })
            .catch((error: PromiseCanceledError) => {
                if (error.isCanceled) {
                    // Выкидываем ошибку отмены наверх, чтоб прервать всю цепочку обработчиков.
                    throw error;
                }

                // Если это не отмена, то логируем ошибку и продолжаем выполнение обработчиков.
                Logger.error('Handler error', null, error);
            })
            .then((viewConfig: ViewConfig | void) => viewConfig || this.getViewConfig(restHandlers, config));
    }
}

const getApplicationHandlers = (): RawHandler[] => {
    // Поле ApplicationConfig, в котором содержатся названия модулей с обработчиками ошибок.
    const CONFIG_PROP = 'errorHandlers';
    const handlers = constants.ApplicationConfig?.[CONFIG_PROP];
    if (!Array.isArray(handlers)) {
        Logger.info(`ApplicationConfig:${CONFIG_PROP} must be Array<Function>`);
        return [];
    }
    return handlers;
};

const DEFAULT_ERROR_TEMPLATE = 'SbisEnvUI/ParkingTemplates:Dialog';

/**
 * Класс для выбора обработчика ошибки и формирования объекта с данными для шаблона ошибки.
 * Передаёт ошибку по цепочке функций-обработчиков.
 * Обработчики предоставляются пользователем или берутся из настроек приложения.
 * @public
 * @author Северьянов А.А.
 * @example
 * <pre class="brush: js">
 * // TypeScript
 *     let handler = ({ error, mode }) => {
 *         if (error.code == 423) {
 *             return {
 *                 template: LockedErrorTemplate,
 *                 options: {
 *                     // ...
 *                 }
 *             }
 *         }
 *     };
 *     let errorController = new ErrorController({
 *         handlers: [handler]
 *     });
 *
 *     this.load().catch((error) => {
 *         return errorController.process(error).then((parking) => {
 *             if (!parking) {
 *                 return;
 *             }
 *             return this.__showError(parking);
 *         });
 *     })
 * </pre>
 */
export default class ErrorController {
    private postHandlers: Handler[] = [];
    private handlerIterator: HandlerIterator = new HandlerIterator();
    private options: IControllerOptions;

    /**
     * @param options Параметры контроллера.
     */
    constructor(
        options?: IControllerOptions,
        private _popupHelper: IPopupHelper = getPopupHelper()
    ) {
        this.options = {
            handlers: [],
            ...options
        };
    }

    destroy(): void {
        delete this.handlerIterator;
        delete this._popupHelper;
        delete this.options;
    }

    /**
     * Добавить обработчик ошибки.
     * @param handler Обработчик ошибки.
     * @param isPostHandler Выполнять ли обработчик после обработчиков уровня приложения.
     */
    addHandler(handler: Handler, isPostHandler?: boolean): void {
        const handlers = isPostHandler ? this.postHandlers : this.options.handlers;
        if (handlers.indexOf(handler) >= 0) {
            return;
        }
        handlers.push(handler);
    }

    /**
     * Убрать обработчик ошибки.
     * @param handler Обработчик ошибки.
     * @param isPostHandler Был ли обработчик добавлен для выполнения после обработчиков уровня приложения.
     */
    removeHandler(handler: Handler, isPostHandler?: boolean): void {
        const deleteHandler = (handlers) => handlers.filter((_handler) => handler !== _handler);
        if (isPostHandler) {
            this.postHandlers = deleteHandler(this.postHandlers);
        } else {
            this.options.handlers = deleteHandler(this.options.handlers);
        }
    }

    onProcess(onProcess?: onProcessCallback): void {
        this.options.onProcess = onProcess;
    }

    /**
     * Обработать ошибку и получить данные для шаблона ошибки.
     * Передаёт ошибку по цепочке функций-обработчиков, пока какой-нибудь обработчик не вернёт результат.
     * @remark
     * Если ни один обработчик не вернёт результат, будет показан диалог с сообщением об ошибке.
     * @param config Обрабатываемая ошибка или объект, содержащий обрабатываемую ошибку и предпочитаемый режим отображения.
     * @return Промис с данными для отображения сообщения об ошибке или промис без данных, если ошибка не распознана.
     */
    process<TError extends ProcessedError = ProcessedError>(
        config: HandlerConfig<TError> | TError
    ): Promise<ViewConfig | void> {
        const handlerConfig = this.getHandlerConfig<TError>(config);

        if (!ErrorController._isNeedHandle(handlerConfig.error)) {
            return Promise.resolve();
        }

        const handlers = [...this.options.handlers, ...getApplicationHandlers(), ...this.postHandlers];

        return this.handlerIterator.getViewConfig(handlers, handlerConfig).then((handlerResult: ViewConfig | void) => {
            /**
             * Ошибка может быть уже обработана, если в соседние контролы прилетела одна ошибка от родителя.
             * Проверяем, обработана ли ошибка каким-то из контроллеров.
             */
            if (!ErrorController._isNeedHandle(handlerConfig.error)) {
                return;
            }

            let viewConfig = handlerResult;

            if (!viewConfig) {
                handlerConfig.error.processed = true;
                viewConfig = this.getDefaultViewConfig(handlerConfig);
            }

            if (this.handlerIterator.lastHandler && this.handlerIterator.lastHandler.handlerType) {
                viewConfig.type = this.handlerIterator.lastHandler.handlerType;
            }

            /**
             * Обработчик может вернуть флаг processed === false в том случае,
             * когда он точно знает, что его ошибку нужно обработать всегда,
             * даже если она была обработана ранее
             */
            handlerConfig.error.processed = viewConfig.processed !== false;

            if (!(config instanceof Error) && config.mode) {
                viewConfig.mode = config.mode;
            }

            if (typeof this.options.onProcess === 'function') {
                const callbackResult = this.options.onProcess(viewConfig);

                if (callbackResult instanceof PromiseCanceledError) {
                    throw callbackResult;
                }

                viewConfig = callbackResult;
            }

            return viewConfig;
        }).catch((error: PromiseCanceledError) => {
            if (!error.isCanceled) {
                Logger.error('Handler error', null, error);
            }
        });
    }

    private getDefaultViewConfig<T extends Error = Error>(config: HandlerConfig<T>): ViewConfig {
        return {
            template: DEFAULT_ERROR_TEMPLATE,
            mode: config.mode,
            options: {
                message: config.error.message
            }
        };
    }

    private getHandlerConfig<T extends Error = Error>(config: HandlerConfig<T> | T): HandlerConfig<T> {
        if (config instanceof Error) {
            return {
                error: config,
                mode: Mode.dialog
            };
        }

        return {
            mode: Mode.dialog,
            ...config
        };
    }

    private static _isNeedHandle(error: ProcessedError & CanceledError): boolean {
        return !(
            (error instanceof fetch.Errors.Abort) ||
            error.processed ||
            error.canceled ||
            error.isCanceled // from PromiseCanceledError
        );
    }
}
