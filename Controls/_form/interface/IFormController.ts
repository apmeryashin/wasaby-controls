import { IContainerConstructor } from 'Controls/_dataSource/error';
import IControllerBase from 'Controls/_form/interface/IControllerBase';
import { error as dataSourceError } from 'Controls/dataSource';
import {Memory} from 'Types/source';

/**
 * Интерфейс для контроллера редактирования записи.
 *
 * @interface Controls/form:IFormController
 * @extends Controls/_form/interface/IControllerBase
 * @public
 * @author Красильников А.С.
 */

export default interface IFormController extends IControllerBase {
    /**
     * @name Controls/form:IFormController#source
     * @cfg {Memory} Источник данных.
     */
    source?: Memory;
    /**
     * @name Controls/form:IFormController#key
     * @cfg {String} Ключ, с помощью которого будет получена запись.
     */
    key?: string;
    /**
     * @name Controls/form:IFormController#isNewRecord
     * @cfg {Boolean} Флаг "Новая запись" означает, что запись инициализируется в источнике данных, но не сохраняется.
     * Если запись помечена флагом isNewRecord, то при сохранении записи запрос на БЛ будет выполнен, даже если запись не изменена.
     * Также при уничтожении контрола будет вызвано удаление записи.
     */
    isNewRecord?: boolean;
    /**
     * @name Controls/form:IFormController#createMetaData
     * @cfg {Object} Задает ассоциативный массив, который используется только при создании новой записи для инициализации её начальными значениями. Создание записи выполняется методом, который задан в опции {@link Types/source:ICrud#create}.
     * Также, это значение по умолчанию метода create.
     */
    createMetaData?: object;
    /**
     * @name Controls/form:IFormController#readMetaData
     * @cfg {Object} Устанавливает набор инициализирующих значений, которые будут использованы при чтении записи. Подробнее {@link Types/source:ICrud#read}.
     * Также, это значение по умолчанию для метода read.
     */
    readMetaData?: object;
    /**
     * @name Controls/form:IFormController#destroyMetaData
     * @cfg {Object} Устанавливает набор инициализирующих значений, которые будут использованы при уничтожении "черновика". Подробнее {@link Types/source:ICrud#destroy}
     * Также, это значение по умолчанию для метода destroy.
     */
    destroyMetaData?: object;
    /**
     * @name Controls/form:IFormController#errorContainer
     * @cfg {Controls/dataSource:error.IContainerConstructor} Компонент для отображения ошибки, он оборачивает весь контент формы.
     * Способ отображения ошибки (диалог, вместо контента или во всю страницу) настраивается через переопределение {@link errorController}.
     * Данную опцию следует определять, если нужно как-то изменить раскладку контента в случае ошибки, если раскладка контрола {@link Controls/_dataSource/_error/Container}, который используется по умолчанию, не устраивает.
     */
    errorContainer?: IContainerConstructor;
    /**
     * @name Controls/form:IFormController#errorController
     * @cfg {Controls/dataSource:error.Controller} Компонент для обработки ошибки.
     * Данную опцию следует определять, если нужно изменить способ отображения ошибки (диалог, вместо контента или во всю страницу) или добавить свои обработчики ошибок.
     */
    errorController?: dataSourceError.Controller;
    /**
     * @name Controls/form:IFormController#initializingWay
     * @cfg {String} Устанавливает способ инициализации данных диалога редактирования.
     * @variant preload В этом режиме FormController строится без данных, ожидая что запись появится на фазе обновления. Используется совместно с режимом предзагрузки данных при построении контрола. Подробнее см опцию {@link Controls/popup:IBaseOpener#dataLoaders}
     * @variant local Верстка контрола строится по записи, переданной в опцию {@link Controls/form:IFormController#record record}, запроса на БЛ нет.
     * @variant read Перед построением верстки выполняется метод "Прочитать" по ключу, переданному в опцию {@link Controls/form:IFormController#key key}. Построение <b>дожидается</b> ответа БЛ.
     * @variant create Перед построением верстки выполняется метод "Создать", построение <b>дожидается</b> ответа БЛ.
     * @variant delayedRead Верстка контрола строится по записи, переданной в опцию {@link Controls/form:IFormController#record record}, параллельно выполняется метод "Прочитать" по ключу,
     * переданному в опции {@link Controls/form:IFormController#key key}.
     * Построение вёрстки контрола <b>не дожидается</b> ответа БЛ.
     * @variant delayedCreate Верстка контрола строится по записи, переданной в опцию
     * {@link Controls/form:IFormController#record record}, параллельно выполняется метод "Создать".
     * Построение вёрстки контрола <b>не дожидается</b> ответа БЛ.
     * @example
     * <pre class="brush: html; highlight: [2]">
     * <!-- WML -->
     * <Controls.form:Controller initializingWay={{_myInitializingWay}}”>
     *    ...
     * </Controls.form:Controller>
     * </pre>
     * <pre class="brush: js;; highlight: [4]">
     * // TypeScript
     * import {INITIALIZING_WAY} from 'Controls/form';
     * _beforeMount() {
     *     this._myInitializingWay = INITIALIZING_WAY.CREATE;
     * }
     * </pre>
     */
    initializingWay?: string;
}

/**
 * @typedef {Object} UpdateConfig
 * @description Параметр сохранения.
 * @property {Object} additionalData Дополнительные данные, которые будут обрабатываться при синхронизации записи с реестром.
 * @property {Boolean} [showLoadingIndicator=true] Отображение индикатора
 */

/**
 * @typedef {Object} CrudConfig
 * @description Параметр Crud операций.
 * @property {Boolean} [showLoadingIndicator=true] Отображение индикатора
 */

/**
 * Обновляет запись в источнике данных. Подробнее {@link Types/source:ICrud#update}.
 * @function Controls/form:IFormController#update
 * @param {UpdateConfig} config Параметр сохранения.
 */

/**
 * Создает пустую запись через источник данных. Подробнее {@link Types/source:ICrud#create}.
 * @function Controls/form:IFormController#create
 * @param {Object} createMetaData
 * @param {CrudConfig} config
 */

/**
 * Считывает запись из источника данных. Подробнее {@link Types/source:ICrud#read}.
 * @function Controls/form:IFormController#read
 * @param {String} key
 * @param {Object} readMetaData
 * @param {CrudConfig} config
 */

/**
 * Удаляет запись из источника данных. Подробнее {@link Types/source:ICrud#delete}.
 * @function Controls/form:IFormController#delete
 * @param {Object} destroyMetaData
 * @param {CrudConfig} config
 */

/**
 * Запускает процесс валидации.
 * @function Controls/form:IFormController#validate
 * @returns {Core/Deferred} Deferred результата валидации.
 */

/**
 * @event Происходит, когда запись создана успешно.
 * @name Controls/form:IFormController#createsuccessed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @see createfailed
 */

/**
 * @event Происходит, когда запись создать не удалось.
 * @name Controls/form:IFormController#createfailed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Error} Error
 * @see createsuccessed
 */

/**
 * @event Происходит, когда запись прочитана успешно.
 * @name Controls/form:IFormController#readsuccessed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @see readfailed
 */

/**
 * @event Происходит, когда запись прочитать не удалось.
 * @name Controls/form:IFormController#readfailed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Error} Error
 * @see readsuccessed
 */

/**
 * @event Происходит, когда запись обновлена успешно.
 * @name Controls/form:IFormController#updatesuccessed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @param {String} key Ключ редактируемой записи.
 * @see updatefailed
 */

/**
 * @event Происходит, когда обновить запись не удалось.
 * @name Controls/form:IFormController#updatefailed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Error} Error
 * @see updatesuccessed
 */

/**
 * @event Происходит, когда запись удалена успешно.
 * @name Controls/form:IFormController#deletesuccessed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @see deletefailed
 */

/**
 * @event Происходит, когда запись удалить не удалось.
 * @name Controls/form:IFormController#deletefailed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Error} Error
 * @see deletesuccessed
 */

/**
 * @event Происходит, когда запись инициализируется в источнике данных.
 * @name Controls/form:IFormController#isNewRecordChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Boolean} isNewRecord
 */

/**
 * @event Происходит перед сохранением записи.
 * @name Controls/form:IFormController#requestCustomUpdate
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @remark
 * В обработчике события можно отменить  базовую логику сохранения (вернуть true) или отложить ее для выполнения пользовательских действий перед сохранением (вернуть Promise<boolean>).
 * Используется, например, для асинхронной валидации или пользовательского сохранения записи.
 * @example
 * Проверяет данные на сервере перед сохранением.
 * <pre class="brush: js;">
 * // TypeScript
 * _requestCustomUpdateHandler(): Promise<boolean> {
 *     return this._checkDataOnServer();
 * }
 * </pre>
 */
