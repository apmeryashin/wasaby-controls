import { HTTPStatus } from 'Browser/Transport';
import { Control, TemplateFunction } from 'UI/Base';
import ErrorController from './Controller';

/**
 * @typedef {Enum} Size
 * @description Перечень размеров для отображения дружелюбной ошибки
 * @property {String} large Большие размеры (ширина области > 500 px)
 * @property {String} medium Средние размеры (ширина области 275 - 500 px)
 * @property {String} normal Нормальные размеры (ширина области 166 - 274 px)
 * @property {String} small Маленькие размеры (ширина области < 166 px)
 * @property {String} dialog Размер диалогового окна
 */
export enum ErrorViewSize {
    large = 'large',
    medium = 'medium',
    normal = 'normal',
    small = 'small',
    dialog = 'dialog'
}

/**
 * @typedef IErrorRepeatConfig
 * @author Кашин О.А.
 * @description Конфиг для кнопки повтора действия, приведшего к ошибке.
 * @property {string} caption Текст для кнопки. По умолчанию "Попробовать еще раз".
 * @property {boolean} display Признак отображения кнопки для повтора действия.
 * @property {Function} function Функция, которая будет вызвана при нажатии на кнопку.
 */
export interface IErrorRepeatConfig {
    caption?: string;
    display?: boolean;
    function?: () => void;
}

/**
 * Опции шаблона для {@link Controls/_error/interface/ErrorViewConfig}, возвращаемые стандартными обработчиками
 * @public
 */
export interface IDefaultTemplateOptions {
    action?: string | TemplateFunction | (new (args: unknown) => Control);
    details?: string;
    image?: string;
    message?: string;
    repeatConfig?: IErrorRepeatConfig;
    size?: ErrorViewSize | string;
}

/**
 * @typedef {Enum} ErrorViewMode
 * @description Способы отображения шаблона с сообщением об ошибке.
 * @variant dialog В диалоговом окне.
 * @variant page Во всю страницу.
 * @variant include В области контрола (вместо содержимого).
 */
export enum ErrorViewMode {
    dialog = 'dialog',
    page = 'page',
    include = 'include',
    inlist = 'inlist'
}

interface IBaseViewConfig<TOptions> {
    /**
     * @name Controls/_error/interface/ErrorViewConfig#options
     * @cfg {Object} Параметры построения шаблона ошибки.
     */
    options: Partial<TOptions>;

    /**
     * @name Controls/_error/interface/ErrorViewConfig#processed
     * @cfg Обработана ли ошибка. Для обработанных ошибок сообщения не выводятся.
     */
    readonly processed?: boolean;

    /**
     * @name Controls/_error/interface/ErrorViewConfig#status
     * @cfg Код состояния HTTP, соответствующий ошибке.
     */
    status?: HTTPStatus;

    /**
     * @name Controls/_error/interface/ErrorViewConfig#type
     * @cfg Если ошибка одна из стандартных, то это поле укажет на ее тип
     */
    type?: ErrorType;
}

interface IDialogViewConfig {
    /**
     * @cfg {ErrorViewMode}
     */
    mode?: ErrorViewMode.dialog;

    /**
     * @name Controls/_dataSource/_parking/ErrorViewConfig#template
     * @cfg {Function | String} Шаблон для отображения ошибки.
     */
    template?: TemplateFunction | string;
}

interface IContainerViewConfig {
    /**
     * @cfg {ErrorViewMode}
     */
    mode: ErrorViewMode.include | ErrorViewMode.inlist | ErrorViewMode.page;

    /**
     * @name Controls/_dataSource/_parking/ErrorViewConfig#template
     * @cfg {Function | String} Шаблон для отображения ошибки.
     */
    template: TemplateFunction | string;
}

/**
 * @typedef ErrorViewConfig
 * @author Кашин О.А.
 * @description Данные для отображения сообщения об ошибке.
 * @property {Function | String} template Шаблон для отображения ошибки.
 * @property {ErrorViewMode} mode Режим отображения ошибки.
 * @property {ErrorType} type Если ошибка одна из стандартных, то это поле укажет на ее тип.
 * @property {IDefaultTemplateOptions} options Опции шаблона, возвращаемые стандартными обработчиками.
 * @property {HTTPStatus} status Код состояния HTTP, соответствующий ошибке.
 * @property {boolean} processed Обработана ли ошибка. Для обработанных ошибок сообщения не выводятся.
 * @property {IErrorRepeatConfig} repeatConfig Конфиг для кнопки повтора действия, приведшего к ошибке.
 */
export type ErrorViewConfig<TOptions extends IDefaultTemplateOptions = IDefaultTemplateOptions> =
    IBaseViewConfig<TOptions> & (IDialogViewConfig | IContainerViewConfig);

export type ProcessedError = Error & { processed?: boolean; };

export type CanceledError = Error & {
    canceled?: boolean;
    isCanceled?: boolean; // from PromiseCanceledError
};

/**
 * @typedef {Enum} ErrorType
 * @description Типы стандартных ошибок.
 * @variant accessDenied Ошибка доступа.
 * @variant connection Разрыв соединения
 * @variant internal Внутренняя ошибка сервера
 * @variant maintenance Техническое обслуживание
 * @variant notFound Ошибка 404
 * @variant require Ошибка загрузки ресурсов
 * @variant rpc Ошибка БЛ
 */
export enum ErrorType {
    accessDenied = 'accessDenied',
    connection = 'connection',
    internal = 'internal',
    maintenance = 'maintenance',
    notFound = 'notFound',
    require = 'require',
    rpc = 'rpc'
}

/**
 * Тип функции-обработчика ошибки.
 * Анализирует ошибку и определяет, какой парковочный шаблон нужно отобразить.
 * Принимает объект с параметрами ошибки и возвращет ErrorViewConfig, если ошибка распознана.
 * @function
 * @param {IErrorHandlerConfig<TError>} config
 * @returns {ErrorViewConfig<TOptions> | void}
 * @public
 * @author Кашин О.А.
 */
export type ErrorHandler<
    TError extends Error = Error,
    TOptions = object
> = (config: IErrorHandlerConfig<TError>) => ErrorViewConfig<TOptions> | void;

/**
 * Параметры для функции-обработчика ошибки.
 * @public
 * @author Кашин О.А.
 */
export interface IErrorHandlerConfig<TError extends ProcessedError = ProcessedError> {
    /**
     * Обрабатываемая ошибка.
     */
    error: TError;

    /**
     * Способ отображения ошибки (на всё окно / диалог / внутри компонента)
     */
    mode: ErrorViewMode;

    /**
     * @name Controls/_dataSource/_error/IErrorHandlerConfig#theme
     * @cfg {String} Тема для окон уведомлений, которые контроллер показывает, если не удалось распознать ошибку.
     */
    theme?: string;
}

/**
 * Интерфейс контролов, использующих источники данных и обрабатывающих ошибки от сервисов через {@link Controls/error:ErrorController error-controller}.
 * @public
 * @author Кашин О.А.
 */
export interface IErrorControllerOptions {
    /**
     * @cfg
     * Компонент для обработки ошибки.
     * Данную опцию следует определять, если нужно изменить способ отображения ошибки (диалог, вместо контента или во всю страницу) или добавить свои обработчики ошибок.
     */
    errorController?: ErrorController;
}
