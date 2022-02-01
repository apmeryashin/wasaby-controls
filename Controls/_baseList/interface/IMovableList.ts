import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {DataSet, CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import {ISelectionObject} from 'Controls/interface';
import {IMoverDialogTemplateOptions} from 'Controls/moverDialog';
import {Model} from 'Types/entity';

/**
 * @typedef {Function} TBeforeMoveCallback
 * @description Функция обратного вызова, вызываемая до перемещения в источнике
 * @param {Controls/interfaces:ISelectionObject} selection
 * @param {Types/entity:Model|Types/source:CrudEntityKey} target
 */
export type TBeforeMoveCallback = (selection: ISelectionObject, target: Model | CrudEntityKey) => (
    boolean | Promise<void>
);

/**
 * Интерфейс настройки {@link /doc/platform/developmentapl/interface-development/controls/list/actions/mover/#move-items-with-dialog диалогового окна} выбора целевой записи для перемещения.
 * @interface Controls/_baseList/interface/IMovableList/IMoveDialogTemplate
 * @public
 * @author Аверкиев П.А.
 */
export interface IMoveDialogTemplate {
    /**
     * @cfg {UI/Base:Control<IControlOptions, unknown> | UI/Base:TemplateFunction | String} Имя контрола, который будет отображаться в диалоговом окне выбора целевой записи, для перемещения.
     */
    templateName: Control<IControlOptions, unknown> | TemplateFunction | string;
    /**
     * @cfg {Controls/moverDialog:IMoverDialogTemplateOptions} Опции для контрола, который будет отображаться в диалоговом окне.
     */
    templateOptions: IMoverDialogTemplateOptions;
    /**
     * @cfg {TBeforeMoveCallback} Функция обратного вызова, вызываемая до перемещения в источнике\
     * @remark
     * Если перемещение необходимо прервать после выбора папки в диалоге, то эта функция должна вернуть false или Promise.reject()
     */
    beforeMoveCallback?: TBeforeMoveCallback;
}

export interface IMovableOptions {
    moveDialogTemplate?: IMoveDialogTemplate;
}

/**
 * Интерфейс контрола View, который обладает возможностью перемещения записей.
 * @public
 * @author Аверкиев П.А.
 */
export interface IMovableList {
    /**
     * Перемещает указанные записи в указанную позицию position, которая может принимать значения after/before/on. Перемещение происходит только в источнике.
     * @function
     * @public
     * @param selection
     * @param targetKey
     * @param position
     */
    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<DataSet>;

    /**
     * Перемещает выбранную запись на одну позицию вверх. Перемещение происходит только в источнике.
     * @function
     * @public
     * @param selectedKey
     */
    moveItemUp(selectedKey: CrudEntityKey): Promise<void>;

    /**
     * Перемещает выбранную запись на одну позицию вниз. Перемещение происходит только в источнике.
     * @function
     * @public
     * @param selectedKey
     */
    moveItemDown(selectedKey: CrudEntityKey): Promise<void>;

    /**
     * Перемещает указанные элементы при помощи диалога MoveDialog, и возвращает результат moveItems().
     * @function
     * @public
     * @param selection
     */
    moveItemsWithDialog(selection: ISelectionObject): Promise<DataSet>;
}

/**
 * @name Controls/_baseList/interface/IMovableList#moveDialogTemplate
 * @cfg {Controls/list:IMoveDialogTemplate} Параметры диалогового окна выбора целевой записи для перемещения.
 * @example
 * <pre class="brush: html; highlight: [6-10]">
 * <!-- WML -->
 * <Controls.list:View
 *      name="list"
 *      source="{{ _viewSource }}"
 *      multiSelectVisibility="visible">
 *      <ws:moveDialogTemplate templateName="Controls/moverDialog:Template">
 *          <ws:templateOptions
 *              root="{{null}}"
 *              rootVisible="{{true}}"
 *              rootTitle="Каталог"
 *              rootLabelVisible="{{false}}"
 *              keyProperty="key"
 *              parentProperty="parent"
 *              displayProperty="title"
 *              hasChildrenProperty="hasChild"
 *              searchParam="title"
 *              nodeProperty="type"
 *              source="{{_moverDataSource}}"
 *              columns="{{_columns}}"/>
 *      </ws:moveDialogTemplate>
 *  </Controls.list:View>
 * </pre>
 * @see Controls/moverDialog:Template
 */
