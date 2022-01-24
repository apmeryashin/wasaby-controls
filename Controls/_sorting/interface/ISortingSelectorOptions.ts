import {IControlOptions} from 'UI/Base';
import {IFontSizeOptions, IFontColorStyleOptions} from 'Controls/interface';
import {IViewMode} from 'Controls/buttons';
import {ISortingParam} from 'Controls/_sorting/interface/ISortingParam';

/**
 * Интерфейс опций для конфигурации параметров сортировки.
 * @interface Controls/sorting:ISortingSelector
 * @public
 * @author Авраменко А.С.
 */
export interface ISortingSelectorOptions extends IControlOptions, IFontColorStyleOptions, IFontSizeOptions {
    /**
     * @name Controls/sorting:ISortingSelector#sortingParams
     * @cfg {Array.<Controls/sorting:ISortingParam>} Параметры сортировки.
     * @demo Controls-demo/gridNew/Sorting/SortingSelector/Default/Index
     * @demo Controls-demo/gridNew/Sorting/SortingSelector/SortingSelectorWithReset/Index
     * @demo Controls-demo/gridNew/Sorting/SortingSelector/Icons/Index
     * @demo Controls-demo/gridNew/Sorting/SortingSelector/ArrowTitle/Index
     * @demo Controls-demo/gridNew/Sorting/SortingSelector/SingleField/Index
     * @example
     * В опцию передается массив вида
     * <pre class="brush: js;">
     * _sortingParam: null,
     * _beforeMount: function(options) {
     *    this._sortingParam = [
     *       {
     *          paramName: 'FirstParam',
     *          title: 'По первому параметру'
     *       },
     *       {
     *          paramName: 'SecondParam',
     *          title: 'По второму параметру'
     *       }
     *    ]
     * }
     * </pre>
     *
     * Чтобы дать возможность сброса сортировки, нужно добавить пункт со значением paramName = null.
     *
     *
     * <pre class="brush: js; highlight: [5]">
     * _sortingParam: null,
     * _beforeMount: function(options) {
     *    this._sortingParam = [
     *       {
     *          paramName: null,
     *          title: 'По умолчанию'
     *       },
     *       {
     *          paramName: 'Name',
     *          title: 'По имени'
     *       }
     *    ]
     * }
     * </pre>
     *
     * Чтобы отобразить иконки в выпадающем списке, нужно задать поля icon и iconSize.
     * Выпадающий элемент так же отобразится в виде иконки
     *
     *
     * <pre class="brush: js; highlight: [5]">
     * _sortingParam: null,
     * _beforeMount: function(options) {
     *    this._sortingParam = [
     *       {
     *          paramName: null,
     *          title: 'По умолчанию',
     *          icon: 'icon-Attach',
     *          iconSize: 's'
     *       },
     *       {
     *          paramName: 'Name',
     *          title: 'По имени',
     *          icon: 'icon-1c',
     *          iconSize: 's'
     *       }
     *    ]
     * }
     * </pre>
     */
    sortingParams: ISortingParam[];
    /**
     * @name Controls/sorting:ISortingSelector#value
     * @cfg {Array.<Object>} Конфигурация сортировки.
     * @remark Если нет возможности сброса сортировки, то опция value должна содержать данные для сортировки.
     * @example
     * <pre class="brush: js;">
     * _sortingValue: null,
     * _sortingParam: null,
     * _beforeMount: function(options) {
     *    this._sortingParam = [
     *       {
     *          paramName: 'Name',
     *          title: 'По имени'
     *       },
     *       {
     *          paramName: 'Surname',
     *          title: 'По фамилии'
     *       }
     *    ]
     *    this._sortingValue = [
     *       {
     *          Name: 'DESC'
     *       }
     *    ];
     * }
     * </pre>
     *
     * Следует использовать директиву bind для опции value.
     *
     * <pre class="brush: html; highlight: [2,4]">
     * <Controls.sorting:Selector
     *   bind:value="_sortingValue"
     *   sortingParams="{{_sortingParam}}" />
     * </pre>
     */
    value: [object];
    /**
     * @name Controls/sorting:ISortingSelector#header
     * @cfg {String} Заголовок для выпадающего списка сортировки.
     * @remark Если заголовок не требуется, опцию можно не указывать.
     * @demo Controls-demo/gridNew/Sorting/SortingSelector/SortingSelectorWithHeader/Index
     */
    header: string;
    /**
     * @name Controls/sorting:ISortingSelector#viewMode
     * @cfg {String} Режим отображения кнопки.
     * @variant linkButton В виде кнопки-ссылки.
     * @variant toolButton В виде кнопки для панели инструментов с круглым ховером.
     * @default linkButton
     * @demo Controls-demo/gridNew/Sorting/SortingSelector/ViewMode/Index
     */
    viewMode: IViewMode;
    /**
     * @name Controls/sorting:ISortingSelector#iconSize
     * @cfg {String} Размер иконки кнопки.
     * @variant s малый
     * @variant m средний
     * @variant l большой
     * @remark Не влияет на размер иконок в меню, их размер фиксирован.
     * @demo Controls-demo/gridNew/Sorting/SortingSelector/IconSize/Index
     */
    iconSize: 's' | 'm' | 'l';
}
