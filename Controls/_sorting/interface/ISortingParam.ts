/**
 * Интерфейс опций для конфигурации параметров сортировки.
 * @interface Controls/sorting:ISortingParam
 * @public
 * @author Авраменко А.С.
 */
export interface ISortingParam {
    /**
     * @name Controls/sorting:ISortingParam#paramName
     * @cfg {String|null} Имя поля элемента, по которому может осуществляться сортировка. Чтобы задать сброс сортировки, нужно указать значение null.
     * @remark Если не задан пункт, сбрасывающий сортировку, то необходимо указать непустую конфигурацию сортировки в опции value.
     */
    paramName: string | null;
    /**
     * @name Controls/sorting:ISortingParam#title
     * @cfg {String} Подпись пункта меню, соответствующего данному полю.
     */
    title: string;
    /**
     * @name Controls/sorting:ISortingParam#icon
     * @cfg {String} Имя иконки, которая отображается в меню рядом с подписью (см. свойство title),
     * а также в заголовке выпадающего меню. Список иконок можно найти в демо-примере {@link Controls/sorting:SortingSelector}.
     * @default undefined
     * @see iconStyle
     * @see iconSize
     */
    icon: string;
    /**
     * @name Controls/sorting:ISortingParam#iconStyle
     * @cfg {String} Стиль иконки.
     * @see icon
     * @see iconSize
     */
    iconStyle: string;
    /**
     * @name Controls/sorting:ISortingParam#iconSize
     * @cfg {String} Размер иконки.
     * @variant s
     * @variant m
     * @variant l
     * @see icon
     * @see iconStyle
     */
    iconSize: 's' | 'm' | 'l';
    /**
     * @name Controls/sorting:ISortingParam#titleAsc
     * @cfg {String} Подсказка при наведении на стрелку сортировки по возрастанию.
     * @see titleDesc
     */
    titleAsc: string;
    /**
     * @name Controls/sorting:ISortingParam#titleDesc
     * @cfg {String} Подсказка при наведении на стрелку сортировки по убыванию.
     * @see titleAsc
     */
    titleDesc: string;
}
