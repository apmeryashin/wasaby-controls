/**
 * Интерфейс стилизованного элемента коллекции
 *
 * @interface Controls/_display/interface/ICollectionItemStyled
 * @public
 * @author Аверкиев П.А.
 */
/*
 * Interface of styled item of collection
 *
 * @interface Controls/_display/interface/ICollectionItemStyled
 * @public
 * @author Аверкиев П.А.
 */
export interface ICollectionItemStyled {
    getMultiSelectClasses(): string;
    getWrapperClasses(templateHighlightOnHover?: boolean, marker?: boolean): string;
    getContentClasses(): string;

    /**
     * Классы CSS для отображения действий над записью
     * @param itemActionsPosition позиция по отношению к записи: 'inside' | 'outside'
     */
    /*
     * CSS classes to show Item Actions
     * @param itemActionsPosition position relative to Item: 'inside' | 'outside'
     */
    getItemActionClasses(itemActionsPosition: string): string;
    /**
     * Возвращает Класс для позиционирования опций записи.
     * Если опции вне строки, то возвращает пустую строку
     * Если itemActionsClass не задан, возвращает классы для позиции itemPadding top
     * Иначе возвращает классы, соответствующие заданным параметрам itemActionsClass и itemPadding
     * @param itemActionsPosition
     * @param itemActionsClass
     * @param itemPadding
     */
    getItemActionPositionClasses(itemActionsPosition: string,
                                 itemActionsClass: string,
                                 itemPadding: {top?: string, bottom?: string}): string;
}
