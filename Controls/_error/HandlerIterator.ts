import { ErrorHandler, IErrorHandlerConfig, ErrorViewConfig } from './interface';
import { loadAsync } from 'WasabyLoader/ModulesLoader';
import { Logger } from 'UICommon/Utils';
import { PromiseCanceledError } from 'Types/entity';

export default class HandlerIterator {
    /**
     * Загружает обработчик
     */
    private load(handler: ErrorHandler | string): Promise<ErrorHandler> {
        return typeof handler === 'string'
            ? loadAsync(handler)
            : Promise.resolve(handler);
    }

    /**
     * Выполнить функцию и вернуть Promise со значением, которое вернула функция.
     */
    private async call(fn: ErrorHandler, arg: IErrorHandlerConfig): Promise<ReturnType<ErrorHandler>> {
        return fn(arg);
    }

    /**
     * Выполнять по очереди обработчики ошибок, пока какой-нибудь из них не вернёт результат.
     */
    getViewConfig(
        [handler, ...restHandlers]: (ErrorHandler | string)[],
        config: IErrorHandlerConfig
    ): Promise<ErrorViewConfig | void> {
        if (!handler) {
            return Promise.resolve();
        }

        return this.load(handler)
            .catch((error: Error) => {
                // Не удалось получить функцию-обработчик.
                // Логируем ошибку и продолжаем выполнение обработчиков.
                Logger.error('Invalid error handler', null, error);
            })
            .then((handlerFn: ErrorHandler) => this.call(handlerFn, config))
            .catch((error: PromiseCanceledError) => {
                if (error.isCanceled) {
                    // Выкидываем ошибку отмены наверх, чтоб прервать всю цепочку обработчиков.
                    throw error;
                }

                // Если это не отмена, то логируем ошибку и продолжаем выполнение обработчиков.
                Logger.error('ErrorHandler error', null, error);
            })
            .then((viewConfig: ErrorViewConfig | void) => viewConfig || this.getViewConfig(restHandlers, config));
    }
}
