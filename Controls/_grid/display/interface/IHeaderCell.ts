import {IControlOptions, TemplateFunction} from 'UI/base';
import {IColspanParams, TCellAlign, TCellVerticalAlign} from './IColumn';

export interface IRowspanParams {
    startRow?: number;
    endRow?: number;
    rowspan?: number;
}

export type THeader = IHeaderCell[];

/**
 * Интерфейс для конфигурации ячеек {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ заголовка} в {@link Controls/grid:View Таблице}.
 * @public
 * @author Авраменко А.С.
 */
export interface IHeaderCell extends IControlOptions, IRowspanParams, IColspanParams {
    /**
     * @cfg Текст заголовка ячейки.
     */
    caption?: string;
    /**
     * @cfg Поведение текста, если он не умещается в ячейке.
     * @variant ellipsis Текст обрезается многоточием.
     * @variant none Текст разбивается на несколько строк.
     * @default none
     */
    textOverflow?: 'none' | 'ellipsis';
    /**
     * @cfg Выравнивание содержимого ячейки по горизонтали.
     * @variant left По левому краю.
     * @variant center По центру.
     * @variant right По правому краю.
     * @default left
     * @see valign
     */
    align?: TCellAlign;
    /**
     * @cfg Выравнивание содержимого ячейки по вертикали.
     * @variant top По верхнему краю.
     * @variant center По центру.
     * @variant bottom По нижнему краю.
     * @see align
     */
    valign?: TCellVerticalAlign;
    /**
     * @cfg Шаблон отображения заголовка ячейки.
     * @default Controls/grid:HeaderContent
     * @remark
     * Параметры шаблона Controls/grid:HeaderContent доступны {@link Controls/grid:HeaderContent здесь}.
     * Подробнее о работе с шаблоном читайте в {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ документации}.
     * @example
     * **Пример 1.** Шаблон и контрол сконфигурированы в одном WML-файле.
     * <pre class="brush: html">
     * <Controls.grid:View>
     *    <ws:header>
     *       <ws:Array>
     *          <ws:Object title="City">
     *             <ws:template>
     *                <ws:partial template="Controls/grid:HeaderContent" scope="{{_options}}">
     *                   <ws:contentTemplate>
     *                      {{contentTemplate.column.config.title}}
     *                   </ws:contentTemplate>
     *                </ws:partial>
     *             </ws:template>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:header>
     * </Controls.grid:View>
     * </pre>
     *
     * **Пример 2.** Контрол и шаблоны сконфигурированы в отдельных WML-файлах.
     * <pre class="brush: html">
     * <!-- file1.wml -->
     * <Controls.grid:View>
     *    <ws:header>
     *       <ws:Array>
     *          <ws:Object title="City">
     *             <ws:template>
     *                <ws:partial template="wml!file2" scope="{{template}}"/>
     *             </ws:template>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:header>
     * </Controls.grid:View>
     * </pre>
     *
     * <pre class="brush: html">
     * <!-- file2.wml -->
     * <ws:partial template="Controls/grid:HeaderContent" scope="{{_options}}">
     *    <ws:contentTemplate>
     *       {{contentTemplate.column.config.title}}
     *    </ws:contentTemplate>
     * </ws:partial>
     * </pre>
     *
     * **Пример 3.** Шаблон contentTemplate сконфигурирован в отдельном WML-файле.
     *
     * <pre class="brush: html">
     * <!-- file1.wml -->
     * <Controls.grid:View>
     *    <ws:header>
     *       <ws:Array>
     *          <ws:Object title="City">
     *             <ws:template>
     *                <ws:partial template="Controls/grid:HeaderContent" scope="{{_options}}">
     *                   <ws:contentTemplate>
     *                      <ws:partial template="wml!file2" scope="{{contentTemplate}}"/>
     *                   </ws:contentTemplate>
     *                </ws:partial>
     *             </ws:template>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:header>
     * </Controls.grid:View>
     * </pre>
     *
     * <pre class="brush: html">
     * <!-- file2.wml -->
     * {{contentTemplate.column.config.title}}
     * </pre>
     *
     * **Пример 4.** Конфигурация колонки для выравнивания контента по копейкам. На шаблон добавлен CSS-класс "controls-Grid&#95;&#95;cell&#95;spacing&#95;money".
     *
     * <pre class="brush: html; highlight: [6]">
     * <Controls.grid:View>
     *    <ws:header>
     *       <ws:Array>
     *          <ws:Object>
     *             <ws:template>
     *                <ws:partial template="Controls/grid:HeaderContent" attr:class="controls-Grid__cell_spacing_money" scope="{{_options}}" >
     *                   ...
     *                </ws:partial>
     *             </ws:template>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:header>
     * </Controls.grid:View>
     * </pre>
     * @see templateOptions
     */
    template?: TemplateFunction|string;
    /**
     * @cfg Имя поля, по которому выполняется сортировка.
     * @remark
     * Если в конфигурации ячейки задать это свойство, то в заголовке таблицы в конкретной ячейке будет отображаться кнопка для изменения сортировки. Клик по кнопке будет менять порядок сортировки элементов на противоположный. При этом элементы будут отсортированы по полю, имя которого указано в свойстве sortingProperty. Одновременно можно сортировать только по одному полю.
     * @example
     * <pre class="brush: js">
     * _sorting: null,
     * _header: null,
     * _beforeMount: function(){
     *    this._sorting = [
     *       {
     *          price: 'DESC'
     *       },
     *       {
     *          balance: 'ASC'
     *       }
     *    ],
     *    this._header = [
     *       {
     *          title: 'Цена',
     *          sortingProperty: 'price'
     *       },
     *       {
     *          title: 'Остаток',
     *          sortingProperty: 'balance'
     *       }
     *    ];
     * }
     * </pre>
     */
    sortingProperty?: string;
    /**
     * @cfg Порядковый номер строки, на которой начинается ячейка.
     * @see endRow
     */
    startRow?: number;
    /**
     * @cfg Порядковый номер строки, на которой заканчивается ячейка.
     * @see startRow
     */
    endRow?: number;
    /**
     * @cfg Порядковый номер колонки, на которой начинается ячейка.
     * @see endColumn
     */
    startColumn?: number;
    /**
     * @cfg Порядковый номер колонки, на которой заканчивается ячейка.
     * @see startColumn
     */
    endColumn?: number;
    /**
     * @cfg Опции, передаваемые в шаблон отображения ячейки заголовка.
     * @see template
     */
    templateOptions?: {[key: string]: unknown};
}
