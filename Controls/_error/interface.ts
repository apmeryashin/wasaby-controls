import { IVersionable } from 'Types/entity';
import { HTTPStatus } from 'Browser/Transport';
import { Control, TemplateFunction } from 'UI/Base';

/**
 * Опции шаблона для {@link Controls/_error/interface/ViewConfig}, возвращаемые стандартными обработчиками
 * @public
 */
export interface IDefaultTemplateOptions {
    details?: string;
    image?: string;
    message?: string;
    action: string | TemplateFunction | (new (args: unknown) => Control);
}

/**
 * Данные для отображения сообщения об ошибке.
 * @public
 * @author Северьянов А.А.
 */
// tslint:disable-next-line:interface-name
export interface ViewConfig<TOptions = IDefaultTemplateOptions> extends Partial<IVersionable> {
    /**
     * @name Controls/_error/interface/ViewConfig#mode
     * @cfg Способ показа ошибки: в диалоге, в контентной области компонента или во всю страницу.
     */
    mode?: Mode;

    /**
     * @name Controls/_error/interface/ViewConfig#options
     * @cfg {Object} Параметры построения шаблона ошибки.
     * @remark
     * This is remark
     */
    options?: Partial<TOptions>;

    /**
     * @name Controls/_error/interface/ViewConfig#processed
     * @cfg Обработана ли ошибка. Для обработанных ошибок сообщения не выводятся.
     */
    readonly processed?: boolean;

    /**
     * @name Controls/_error/interface/ViewConfig#status
     * @cfg Код состояния HTTP, соответствующий ошибке.
     */
    status?: HTTPStatus;

    /**
     * @name Controls/_dataSource/_parking/ViewConfig#template
     * @cfg {Function | String} Шаблон для отображения ошибки.
     */
    template: TemplateFunction | string;

    /**
     * @name Controls/_error/interface/ViewConfig#type
     * @cfg Если ошибка одна из стандартных, то это поле укажет на ее тип
     */
    type?: DefaultErrorTypes;
}

export type ProcessedError = Error & { processed?: boolean; };

export type CanceledError = Error & {
    canceled?: boolean;
    isCanceled?: boolean; // from PromiseCanceledError
};

export enum DefaultErrorTypes {
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
    handlerType?: DefaultErrorTypes;
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
