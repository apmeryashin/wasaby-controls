export type IDirection = 'up' | 'down';
/**
 * Интерфейс для поддержки {@link /doc/platform/developmentapl/interface-development/controls/list/performance-optimization/virtual-scroll/ виртуального скроллирования} в списках.
 *
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for lists that can use virtual scroll.
 *
 * @public
 * @author Авраменко А.С.
 */
export interface IVirtualScrollConfig {
    /**
     * @cfg Количество отображаемых элементов при инициализации списка.
     */
    pageSize?: number;
    /**
     * @cfg Количество подгружаемых элементов при скроллировании. По умолчанию равен четверти размера виртуальной страницы, который задан в опции pageSize.
     * @default {@link pageSize}/4
     */
    segmentSize?: number;
    /**
     * @cfg Имя поля, которое содержит высоту элемента.
     * @default undefined
     */
    itemHeightProperty?: string;
    /**
     * @cfg Высота контейнера со списком.
     * @default undefined
     */
    viewportHeight?: number;
    /**
     * @cfg Режим управления элементами виртуального скроллинга.
     * @variant remove Скрытые элементы удаляются из DOM.
     * @variant hide Скрытые элементы скрываются из DOM с помощью ws-hidden.
     * @default remove
     */
    mode?: 'hide'|'remove';
}

export type IVirtualScrollMode = 'remove' | 'hide';

/**
 * @name Controls/_baseList/interface/IVirtualScrollConfig#virtualScrollConfig
 * @cfg {Controls/_baseList/interface/IVirtualScrollConfig} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/performance-optimization/virtual-scroll/ виртуального скролла}.
 * @remark
 * Виртуальный скролл работает только при включенной {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/ навигации} в виде {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/infinite-scrolling/ бесконечной прокрутки}.
 * @example
 * В следующем примере показана конфигурация виртуального скролла: в свойстве pageSize задан размер виртуальной страницы.
 * Также задана конфигурация навигации в опции navigation.
 * <pre class="brush: html; highlight: [4,5]">
 * <!-- WML -->
 * <Controls.scroll:Container ...>
 *     <Controls.list:View
 *         source="{{_viewSource}}"
 *         navigation="{{_options.navigation}}">
 *         <ws:virtualScrollConfig pageSize="{{100}}"/>
 *     </Controls.list:View>
 * </Controls.scroll:Container>
 * </pre>
 * @demo Controls-demo/list_new/VirtualScroll/ConstantHeights/Default/Index
 * @see Controls/interface:INavigation#navigation
 */


/**
 * @event Происходит при использовании виртуального скролла, когда список находится в такой позиции, что сверху и снизу списка есть скрытые (или доступные для загрузки) элементы.
 * @remark По этому событию скрывается контент {@link Controls/scroll:VirtualScrollContainer} с опцией position, соответствующей параметру в событии.
 * @name Controls/_baseList/interface/IVirtualScrollConfig#enableVirtualNavigation
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {'top' | 'bottom'} position Положение, в котором будет скрыт контент Controls/scroll:VirtualScrollContainer.
 * @see disableVirtualNavigation
 */

/**
 * @event Происходит при использовании виртуального скролла, когда список находится в такой позиции, что сверху или снизу списка нет скрытых (или доступных для загрузки) элементов.
 * @remark По этому событию показывается контент {@link Controls/scroll:VirtualScrollContainer} с опцией position соответствующей параметру в событии.
 * @name Controls/_baseList/interface/IVirtualScrollConfig#disableVirtualNavigation
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {'top' | 'bottom'} position Положение, в котором будет скрыт контент Controls/scroll:VirtualScrollContainer.
 * @see enableVirtualNavigation
 */