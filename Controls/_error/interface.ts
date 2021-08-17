import { IVersionable } from 'Types/entity';
import { HTTPStatus } from 'Browser/Transport';
import { TemplateFunction } from 'UICommon/_base/Control';

/**
 * Данные для отображения сообщения об ошибке.
 * @public
 * @author Северьянов А.А.
 */
export interface ViewConfig<TOptions = object> extends Partial<IVersionable> { // tslint:disable-line:interface-name
    /**
     * Способ показа ошибки: в диалоге, в контентной области компонента или во всю страницу.
     */
    mode?: Mode;

    /**
     * @name Controls/_dataSource/_parking/ViewConfig#options
     * @cfg {Object} Параметры построения шаблона ошибки.
     * @remark
     * This
     */
    options?: Partial<TOptions>;

    /**
     * Обработана ли ошибка. Для обработанных ошибок сообщения не выводятся.
     */
    readonly processed?: boolean;

    /**
     * Код состояния HTTP, соответствующий ошибке.
     */
    status?: HTTPStatus;

    /**
     * @name Controls/_dataSource/_parking/ViewConfig#template
     * @cfg {Function | String} Шаблон для отображения ошибки.
     */
    template: TemplateFunction | string;
}

export type ProcessedError = Error & { processed?: boolean; };

export type CanceledError = Error & {
    canceled?: boolean;
    isCanceled?: boolean; // from PromiseCanceledError
};

export enum AppHandlerTypes {
    javaScript = 'javaScript',
    require = 'require',
    internal = 'internal',
    notFound = 'notFound',
    maintenance = 'maintenance',
    connection = 'connection',
    accessDenied = 'accessDenied',
    rpc = 'rpc'
}

/**
 * Тип функции-обработчика ошибки.
 * Анализирует ошибку и определяет, какой парковочный шаблон нужно отобразить.
 * Принимает объект с параметрами ошибки и возвращет ViewConfig, если ошибка распознана.
 * @interface Controls/_dataSource/_error/Handler
 * @public
 * @author Северьянов А.А.
 */
export type Handler< // tslint:disable-line:interface-over-type-literal
    TError extends Error = Error,
    TOptions = object
> = {
    handlerType?: AppHandlerTypes;
    (config: HandlerConfig<TError>): ViewConfig<TOptions> | void;
};

/**
 * Параметры для функции-обработчика ошибки.
 * @public
 * @author Северьянов А.А.
 */
export interface HandlerConfig<TError extends ProcessedError = ProcessedError> { // tslint:disable-line:interface-name
    /**
     * Обрабатываемая ошибка.
     */
    error: TError;

    /**
     * Способ отображения ошибки (на всё окно / диалог / внутри компонента)
     */
    mode: Mode;

    /**
     * @name Controls/_dataSource/_error/HandlerConfig#theme
     * @cfg {String} Тема для окон уведомлений, которые контроллер показывает, если не удалось распознать ошибку.
     */
    theme?: string;
}

/**
 * Перечисление. Способы отображения шаблона с сообщением об ошибке.
 * @class Controls/_error/Mode
 * @public
 * @author Северьянов А.А.
 * @todo Переписать как typedef, как появится возможность автодоки прогружать из библиотек тайпдефы
 */
export enum Mode {
    /**
     * @name Controls/_error/Mode#dialog
     * @cfg {string} В диалоговом окне.
     */
    dialog = 'dialog',
    /**
     * @name Controls/_error/Mode#page
     * @cfg {string} Во всю страницу.
     */
    page = 'page',
    /**
     * @name Controls/_error/Mode#include
     * @cfg {string} В области контрола (вместо содержимого).
     */
    include = 'include',
    /**
     * @name Controls/_error/Mode#inlist
     * @cfg {string} В области списка (вместе с содержимым).
     */
    inlist = 'inlist'
}
