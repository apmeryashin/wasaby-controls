import { ITree, ITreeControlOptions } from 'Controls/tree';
import { IGridControl } from 'Controls/grid';

/**
 * @typedef {String} Controls/_treeGrid/interface/ITreeGrid/TGroupNodeVisibility
 * Доступные значения для {@link Controls/_treeGrid/interface/ITreeGrid#groupNodeVisibility видимости групп в иерархической группировке}
 * @variant visible Всегда показывать полученные из источника данных группы в иерархической группировке.
 * @variant hasdata Показывать полученные из источника данных группы в иерархической группировке только если в метаданных передан параметр singleGroupNode со значением, отличным от true.
 */
export type TGroupNodeVisibility = 'hasdata' | 'visible';

export interface IOptions extends ITreeControlOptions {
    groupNodeVisibility?: TGroupNodeVisibility;
    deepScrollLoad?: boolean;
}

/**
 * Интерфейс дерева-таблицы
 * @implements Controls/interface/IGroupedList
 *
 * @public
 * @author Аверкиев П.А.
 */
export default interface ITreeGrid extends ITree, IGridControl {
    readonly '[Controls/_treeGrid/interface/ITreeGrid]': true;
}

/**
 * @name Controls/_treeGrid/interface/ITreeGrid#nodeTypeProperty
 * @cfg {String} Имя свойства, содержащего информацию о типе узла.
 * @remark
 * Используется для отображения узлов в виде групп. (См. {@link Controls/treeGrid:IGroupNodeColumn Колонка списка с иерархической группировкой.})
 * Если в RecordSet в указанном свойстве с БЛ приходит значение 'group', то такой узел должен будет отобразиться как группа.
 * При любом другом значении узел отображается как обычно с учётом nodeProperty
 * @example
 * В следующем примере показано, как настроить список на использование узлов-групп
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.treeGrid:View
 *    source="{{_source}}"
 *    nodeProperty="{{parent@}}"
 *    parentProperty="{{parent}}"
 *    nodeTypeProperty="customNodeType"/>
 * </pre>
 *
 * <pre class="brush: js">
 * // TypeScript
 * class MyControl extends Control<IControlOptions> {
 *    _source: new Memory({
 *        keyProperty: 'id',
 *        data: [
 *            {
 *                id: 1,
 *                customNodeType: 'group',
 *                'parent@': true,
 *                parent: null
 *            },
 *            {
 *                id: 2,
 *                customNodeType: null,
 *                ...
 *            },
 *            {
 *                id: 3,
 *                customNodeType: 'group',
 *                'parent@': true,
 *                parent: null
 *            },
 *        ]
 *    })
 * }
 * </pre>
 *
 * @name Controls/_treeGrid/interface/ITreeGrid#groupNodeVisibility
 * @cfg {TGroupNodeVisibility} Видимость групп в иерархической группировке
 * @variant visible Всегда показывать полученные из источника данных группы в иерархической группировке.
 * @variant hasdata Показывать полученные из источника данных группы в иерархической группировке только если в метаданных передан параметр singleGroupNode со значением, отличным от true.
 * @default visible
 */

/**
 * @name Controls/_treeGrid/interface/ITreeGrid#deepScrollLoad
 * @cfg {String} Имя свойства, содержащего информацию о типе узла.
 * @remark
 * Опция необходима для подгрузки дерева с раскрытыми узлами по скроллу. При этом необходимо с БЛ линейно
 * возвращать строго отсортированные данные дерева с раскрытыми узлами.
 */

/**
 * @name Controls/_treeGrid/interface/ITreeGrid#columns
 * @cfg {Array.<Controls/treeGrid:IColumn>} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/grid/columns/ колонок} дерева с колонками.
 * @remark
 * Если при отрисовске контрола данные не отображаются или выводится только их часть, то следует проверить {@link Controls/collection:RecordSet}, полученный от {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}.
 * Такой RecordSet должен содержать набор полей, которые заданы в конфигурации контрола в опции columns, а также сами данные для каждого поля.
 * @example
 * <pre class="brush: js">
 * _columns: null,
 * _beforeMount: function() {
 *    this._columns = [
 *       {
 *          displayProperty: 'name',
 *          width: '1fr',
 *          align: 'left',
 *          template: _customNameTemplate
 *       },
 *       {
 *          displayProperty: 'balance',
 *          align: 'right',
 *          width: 'auto',
 *          resutTemplate: _customResultTemplate,
 *          result: 12340
 *       }
 *    ];
 * }
 * </pre>
 * <pre class="brush: html">
 *  <Controls.grid:View columns="{{_columns}}" />
 * </pre>
 */
