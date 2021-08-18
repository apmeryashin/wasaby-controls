import { Logger } from 'UI/Utils';
import { PromiseCanceledError } from 'Types/entity';
import { constants } from 'Env/Env';
import { loadAsync } from 'WasabyLoader/ModulesLoader';
import { fetch } from 'Browser/Transport';
import {
    AppHandlerTypes,
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
     * @cfg {Controls/error:ViewConfig} Конфигурация для отображения ошибки по умолчанию.
     * Эта конфигурация объединится с той, которую вернёт обработчик ошибки.
     */
    viewConfig?: Partial<ViewConfig>;

    standardViewConfigs?: Partial<Record<AppHandlerTypes, Partial<ViewConfig>>>;
}

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
            viewConfig: {},
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

    /**
     * Обработать ошибку и получить данные для шаблона ошибки.
     * Передаёт ошибку по цепочке функций-обработчиков, пока какой-нибудь обработчик не вернёт результат.
     * @remark
     * Если ни один обработчик не вернёт результат, будет показан диалог с сообщением об ошибке.
     * @param config Обрабатываемая ошибка или объект, содержащий обрабатываемую ошибку и предпочитаемый режим отображения.
     * @return Промис с данными для отображения сообщения об ошибке или промис без данных, если ошибка не распознана.
     * @todo нужно оставить в аргументах только ошибку, начиная с 21.6100
     */
    process<TError extends ProcessedError = ProcessedError>(
        config: HandlerConfig<TError> | TError
    ): Promise<ViewConfig | void> {
        const handlerConfig = this.getHandlerConfig<TError>(config);

        if (!ErrorController._isNeedHandle(handlerConfig.error)) {
            return Promise.resolve();
        }

        const handlers = [...this.options.handlers, ...getApplicationHandlers(), ...this.postHandlers];

        return this.handlerIterator.getViewConfig(handlers, handlerConfig).then((viewConfig: ViewConfig | void) => {
            /**
             * Ошибка может быть уже обработана, если в соседние контролы прилетела одна ошибка от родителя.
             * Проверяем, обработана ли ошибка каким-то из контроллеров.
             */
            if (!ErrorController._isNeedHandle(handlerConfig.error)) {
                return;
            }

            if (!viewConfig) {
                handlerConfig.error.processed = true;
                return this.getDefault(handlerConfig);
            }

            /**
             * Обработчик может вернуть флаг processed === false в том случае,
             * когда он точно знает, что его ошибку нужно обработать всегда,
             * даже если она была обработана ранее
             */
            handlerConfig.error.processed = viewConfig.processed !== false;

            // mode, переданная в конфиге функции process, временно в приоритете (до 21.6100)
            const processMode = config instanceof Error ? undefined : config.mode;
            return this.composeViewConfig(viewConfig, processMode);
        }).catch((error: PromiseCanceledError) => {
            if (!error.isCanceled) {
                Logger.error('Handler error', null, error);
            }
        });
    }

    /**
     * Составить конфиг ошибки из предустановленных данных и результата из обработчика.
     * @param viewConfig Результат обработчика
     * @param processMode Предпочтительный режим отображения
     */
    private composeViewConfig(viewConfig: ViewConfig, processMode?: Mode): ViewConfig {
        let customStandardConfig: Partial<ViewConfig> = { options: {} };

        if (this.handlerIterator.lastHandler && this.options.standardViewConfigs) {
            customStandardConfig =
                this.options.standardViewConfigs[this.handlerIterator.lastHandler.handlerType] || customStandardConfig;
        }

        const result = {
            ...viewConfig,
            ...customStandardConfig,
            ...this.options.viewConfig,
            options: {
                ...viewConfig.options,
                ...customStandardConfig.options,
                ...this.options.viewConfig.options
            }
        };

        if (processMode) {
            result.mode = processMode;
        }

        return result;
    }

    private getDefault<T extends Error = Error>(config: HandlerConfig<T>): void {
        this._popupHelper.openConfirmation({
            type: 'ok',
            style: 'danger',
            theme: config.theme,
            message: config.error.message
        });
    }

    private getHandlerConfig<T extends Error = Error>(config: HandlerConfig<T> | T): HandlerConfig<T> {
        const mode = this.options.viewConfig.mode || Mode.dialog;

        if (config instanceof Error) {
            return {
                error: config,
                mode
            };
        }

        return {
            mode,
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
