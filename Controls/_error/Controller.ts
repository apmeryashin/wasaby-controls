import { Logger } from 'UI/Utils';
import { PromiseCanceledError } from 'Types/entity';
import { constants } from 'Env/Env';
import { fetch } from 'Browser/Transport';
import HandlerIterator from './HandlerIterator';
import {
    ErrorHandler,
    IErrorHandlerConfig,
    ProcessedError,
    ErrorViewConfig,
    ErrorViewMode,
    CanceledError
} from './interface';

/**
 * Параметры конструктора контроллера ошибок.
 * @public
 */
export interface IControllerOptions {
    /**
     * Пользовательские обработчики ошибок.
     */
    handlers?: ErrorHandler[];

    /**
     * Пользовательские постобработчики ошибок.
     */
    postHandlers?: ErrorHandler[];

    /**
     * @cfg {Controls/error:ErrorViewConfig} Эта функция будет вызвана во время обработки ошибки.
     * Она возвращает конфигурацию для отображения ошибки.
     * Эта конфигурация объединится с той, которую вернёт обработчик ошибки.
     */
    onProcess?: OnProcessCallback;
}

export type OnProcessCallback = (viewConfig: ErrorViewConfig) => ErrorViewConfig;

const getApplicationHandlers = (configProp: string): string[] => {
    const handlers = constants.ApplicationConfig?.[configProp];
    if (!Array.isArray(handlers)) {
        Logger.info(`ApplicationConfig:${configProp} must be Array<Function>`);
        return [];
    }
    return handlers;
};

export interface IProcessConfig<TError extends ProcessedError = ProcessedError> {
    /**
     * Обрабатываемая ошибка.
     */
    error: TError;

    /**
     * Способ отображения ошибки (на всё окно / диалог / внутри компонента)
     */
    mode?: ErrorViewMode;

    /**
     * @name Controls/_dataSource/_error/IErrorHandlerConfig#theme
     * @cfg {String} Тема для окон уведомлений, которые контроллер показывает, если не удалось распознать ошибку.
     */
    theme?: string;
}

/**
 * Класс для выбора обработчика ошибки и формирования объекта с данными для шаблона ошибки.
 * Передаёт ошибку по цепочке функций-обработчиков.
 * Обработчики предоставляются пользователем или берутся из настроек приложения.
 * @public
 * @author Кашин О.А.
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
    private handlers: ErrorHandler[];
    private postHandlers: ErrorHandler[];
    private handlerIterator: HandlerIterator = new HandlerIterator();
    private onProcess: OnProcessCallback;

    constructor(
        options?: IControllerOptions
    ) {
        this.handlers = options?.handlers?.slice() || [];
        this.postHandlers = options?.postHandlers?.slice() || [];
        this.onProcess = options?.onProcess;
    }

    /**
     * Добавить обработчик ошибки.
     * @param handler Обработчик ошибки.
     * @param isPostHandler Выполнять ли обработчик после обработчиков уровня приложения.
     */
    addHandler(handler: ErrorHandler, isPostHandler?: boolean): void {
        const handlers = isPostHandler ? this.postHandlers : this.handlers;

        if (!handlers.includes(handler)) {
            handlers.push(handler);
        }
    }

    /**
     * Убрать обработчик ошибки.
     * @param handler Обработчик ошибки.
     * @param isPostHandler Был ли обработчик добавлен для выполнения после обработчиков уровня приложения.
     */
    removeHandler(handler: ErrorHandler, isPostHandler?: boolean): void {
        const deleteHandler = (hs: ErrorHandler[]) => hs.filter((h) => handler !== h);

        if (isPostHandler) {
            this.postHandlers = deleteHandler(this.postHandlers);
        } else {
            this.handlers = deleteHandler(this.handlers);
        }
    }

    setOnProcess(onProcess?: OnProcessCallback): void {
        this.onProcess = onProcess;
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
        config: IProcessConfig<TError> | TError
    ): Promise<ErrorViewConfig | void> {
        const handlerConfig = ErrorController.getHandlerConfig<TError>(config);
        const { error } = handlerConfig;

        if (!ErrorController.isNeedHandle(error)) {
            return Promise.resolve();
        }

        const handlers = [
            ...this.handlers,
            ...getApplicationHandlers(ErrorController.APP_CONFIG_PROP),
            ...this.postHandlers
        ];

        return this.handlerIterator.getViewConfig(handlers, handlerConfig)
            .then((handlerResult: ErrorViewConfig | void) => {
                /**
                 * Ошибка может быть уже обработана, если в соседние контролы прилетела одна ошибка от родителя.
                 * Проверяем, обработана ли ошибка каким-то из контроллеров.
                 */
                if (!ErrorController.isNeedHandle(error)) {
                    return;
                }

                const viewConfig = handlerResult || ErrorController.getDefaultViewConfig(error);

                /**
                 * Обработчик может вернуть флаг processed === false в том случае,
                 * когда он точно знает, что его ошибку нужно обработать всегда,
                 * даже если она была обработана ранее
                 */
                error.processed = viewConfig.processed !== false;

                if (!(config instanceof Error) && config.mode) {
                    viewConfig.mode = config.mode;
                } else {
                    viewConfig.mode = viewConfig.mode || ErrorViewMode.dialog;
                }

                if (typeof this.onProcess === 'function') {
                    return this.onProcess(viewConfig);
                }

                return viewConfig;
            }).catch((err: PromiseCanceledError) => {
                if (!err.isCanceled) {
                    Logger.error('ErrorHandler error', null, err);
                }
            });
    }

    // Поле ApplicationConfig, в котором содержатся названия модулей с обработчиками ошибок.
    private static readonly APP_CONFIG_PROP: string = 'errorHandlers';

    private static getDefaultViewConfig({ message }: Error): ErrorViewConfig {
        return {
            mode: ErrorViewMode.dialog,
            options: {
                message
            }
        };
    }

    private static getHandlerConfig<TError extends Error = Error>(
        config: IProcessConfig<TError> | TError
    ): IErrorHandlerConfig<TError> {
        if (config instanceof Error) {
            return {
                error: config,
                mode: ErrorViewMode.dialog
            };
        }

        return {
            mode: ErrorViewMode.dialog,
            ...config
        };
    }

    private static isNeedHandle(error: ProcessedError & CanceledError): boolean {
        return !(
            (error instanceof fetch.Errors.Abort) ||
            error.processed ||
            error.canceled ||
            error.isCanceled // from PromiseCanceledError
        );
    }
}
