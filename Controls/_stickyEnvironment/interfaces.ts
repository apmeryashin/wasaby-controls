/**
 * Интерфейс описывает структуру объекта, содержащего информацию о граничных данных относительно верхней границы {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController})
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface ITopEdgeData<TData = unknown> {
    /**
     * Данные, которые ближе всего находятся к верхней границе за пределами видимости
     * корневого элемента либо пересекают её
     */
    above: TData;

    /**
     * Данные, которые ближе всего находятся к верхней границе в пределах видимости
     * корневого элемента
     */
    below: TData;
}

/**
 * Интерфейс описывает структуру объекта, содержащего информацию о граничных данных относительно нижней границы {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController})
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IBottomEdgeData<TData = unknown> {
    /**
     * Данные, которые ближе всего находятся к нижней границе в пределах видимости
     * корневого элемента либо пересекают её
     */
    above: TData;

    /**
     * Данные, которые ближе всего находятся к нижней границе за пределами видимости
     * корневого элемента
     */
    below: TData;
}

/**
 * Интерфейс описывает структуру объекта, содержащего информацию о граничных данных относительно верхней и нижней границы {@link Controls/scroll:Container} (либо {@link Controls/scroll:IntersectionObserverController})
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IEdgesData<TData = unknown> {
    // Пограничные данные относительно верхней границы
    top: ITopEdgeData<TData>;
    // Пограничные данные относительно нижней границы
    bottom: IBottomEdgeData<TData>;
}
