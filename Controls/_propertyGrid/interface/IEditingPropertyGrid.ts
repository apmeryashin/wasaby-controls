import {Model} from 'Types/entity';
import {IItemEditOptions} from 'Controls/list';

/**
 * @typedef {Object} IOperationCanceledResult
 * @description Объект, который может возвращать Promise при вызове методов {@link beginAdd}, {@link beginEdit}, {@link cancelEdit} и {@link commitEdit}.
 * @property {Boolean} canceled Свойство установлено в значение true при отмене:
 *
 * * завершения редактирование/добавление по месту без сохранения введенных данных.
 * * запуска добавления по месту.
 * * запуска редактирования по месту.
 * * при ошибке валидации.
 */
interface IOperationCanceledResult { canceled: true; }

/**
 * @typedef {Promise<void | IOperationCanceledResult>} TAsyncOperationResult
 * @description Результат выполнения методов {@link beginAdd}, {@link beginEdit}, {@link cancelEdit} и {@link commitEdit}.
 */
type TAsyncOperationResult = Promise<void | IOperationCanceledResult>;

/**
 * Интерфейс для {@link /doc/platform/developmentapl/interface-development/controls/property-grid/ редактора свойств} с возможностью редактирования по месту.
 * @interface Controls/_propertyGrid/interface/IEditingPropertyGrid
 * @public
 * @author Авраменко А.С.
 * @see Controls/editableArea:View
 * @remark
 * Разница между этим интерфейсом и {@link Controls/editableArea:View Controls/editableArea:View} заключается в том, что первый используется в списках, а второй — вне их (например, на вкладках).
 */
export interface IEditingPropertyGrid {
    _options: {
        /**
         * @name Controls/_propertyGrid/interface/IEditingPropertyGrid#editingConfig
         * @cfg {Controls/_propertyGrid/interface/IEditingConfig | undefined} Конфигурация редактирования по месту.
         * @demo Controls-demo/PropertyGridNew/AddInPlace/GridRender/Index
         */
        editingConfig?: IEditingConfig
    };

    /**
     * Запускает редактирование по месту.
     * Использование метода в редакторе свойств с режимом "только чтение" невозможно.
     * @function
     * @param {Controls/list:IItemEditOptions} options Параметры редактирования.
     * @returns {TAsyncOperationResult}
     * Promise разрешается после монтирования контрола в DOM.
     */
    beginEdit(options?: IItemEditOptions): TAsyncOperationResult;
}

/**
 * Интерфейс объекта-конфигурации редактирования по месту.
 *
 * @interface Controls/_propertyGrid/interface/IEditingConfig
 * @public
 * @author Аверкиев П.А.
 */
export interface IEditingConfig {
    /**
     * @name Controls/_propertyGrid/interface/IEditingConfig#editOnClick
     * @cfg {Boolean} Запуск редактирования по месту при клике по элементу списка. Является частью {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/basic/ базовой конфигурации} функционала редактирования по месту.
     * @variant true Включен.
     * @variant false Отключен.
     * @default false
     */
    editOnClick?: boolean;
    /**
     * @name Controls/_propertyGrid/interface/IEditingConfig#toolbarVisibility
     * @cfg {Boolean} Видимость кнопок "Сохранить" и "Отмена", отображаемых на {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи} в режиме редактирования.
     * @variant true Кнопки видны.
     * @variant false Кнопки скрыты.
     * @default false
     * @remark
     * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/item-actions/#visible здесь}.
     */
    toolbarVisibility?: boolean;
    /**
     * @name Controls/_propertyGrid/interface/IEditingConfig#item
     * @cfg {Types/entity:Model} Автоматический запуск редактирования/добавления по месту при инициализации списка.
     * @remark
     * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/init/ здесь}.
     * @default undefined
     */
    item?: Model;
}
