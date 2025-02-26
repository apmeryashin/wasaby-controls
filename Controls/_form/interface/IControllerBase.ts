import {IControlOptions} from 'UI/Base';
import {Model} from 'Types/entity';

/**
 * Интерфейс для котрола, реализующего функционал редактирования записи.
 * @interface Controls/form:IControllerBase
 * @public
 * @author Мочалов М.А.
 */
export default interface IControllerBase extends IControlOptions {
    /**
     * @name Controls/form:IControllerBase#record
     * @cfg {Types/entity:Model} Запись, по данным которой будет инициализирован диалог редактирования.
     */
    record: Model;
    /**
     * @name Controls/form:IControllerBase#confirmationShowingCallback
     * @cfg {Function} Функция, которая определяет должно ли показаться окно с подтверждением сохранения/не сохранения измененных данных при закрытии диалога редактирования записи. Необходимо для случаев, когда есть измененные данные, не связанные с рекордом.
     * @remark
     * Если из функции возвращается true, тогда окно покажется, а если false - нет.
     */
    confirmationShowingCallback?: Function;
    /**
     * @name Controls/form:IControllerBase#keyProperty
     * @cfg {String} Имя свойства элемента, однозначно идентифицирующего элемент коллекции.
     */
    keyProperty?: string;
}

export interface IUpdateConfig {
    additionalData?: Record<string, unknown>;
    updateMetaData?: Record<string, unknown>;
    showLoadingIndicator?: boolean;
}

/**
 * @typedef {Object} UpdateConfig
 * @description Параметр сохранения.
 * @property {Object} updateMetaData Дополнительные данные, которые будут переданы в метод записи.
 * @property {Object} additionalData Дополнительные данные, которые будут обрабатываться при синхронизации записи с реестром.
 * @property {Boolean} [showLoadingIndicator=true] Отображение индикатора
 */

/**
 * Вызывает сохранение записи (завершение всех редактирований по месту, валидация).
 * @function Controls/form:IControllerBase#update
 * @param {Controls/form:IControllerBase/UpdateConfig.typedef} config Параметр сохранения.
 * @return {Promise<void>}
 */

/**
 * Запускает процесс валидации.
 * @function Controls/form:IControllerBase#validate
 * @return {Promise<Controls/validate:IValidateResult|Error>}
 */

/**
 * @event Происходит, когда запись обновлена успешно (валидация прошла успешно, редактирование по месту завершилось).
 * @name Controls/form:IControllerBase#updateSuccessed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @see updatefailed
 */

/**
 * @event Происходит при ошибке валидации.
 * @name Controls/form:IControllerBase#validationFailed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array} validationFailed Результаты валидации.
 * @see validationSuccessed
 */

/**
 * @event Происходит при отсутствии ошибок валидации.
 * @name Controls/form:IControllerBase#validationSuccessed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @see validationFailed
 */
