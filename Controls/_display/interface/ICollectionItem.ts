import {IInstantiable, IVersionable, Model} from 'Types/entity';
import {ICollection} from './ICollection';

/**
 * @typedef {String} Controls/display:TRowSeparatorVisibility
 * Варианты значений для опции rowSeparatorVisibility
 * @variant all Разделители строк и по краям списка и между записями
 * @variant edges разделители только по краям
 * @variant items разделители только между записями
 */
export type TRowSeparatorVisibility = 'all'|'items'|'edges';

/**
 * @typedef {String} Controls/display:TBorderVisibility
 * Варианты значений для опции видимочти рамки вокруг записи (borderVisibility)
 * @variant hidden рамка скрыта
 * @variant visible рамка показана всегда
 * @variant onhover рамка показывается по ховеру на запись
 */
export type TBorderVisibility = 'hidden'|'visible'|'onhover';

/**
 * @typedef {String} Controls/display:TShadowVisibility
 * Варианты значений для опции видимочти тени вокруг записи (shadowVisibility)
 * @variant hidden тень скрыта
 * @variant visible тень показана всегда
 * @variant onhover тень показывается по ховеру на запись
 */
export type TShadowVisibility = 'hidden'|'visible'|'onhover';

/**
 * Варианты настройки размеров маркера
 * @typedef {String} Controls/_display/interface/ICollectionItem/TMarkerClassName
 * @variant default Маркер по высоте растягивается на весь контейнер записи.
 * @variant image-l Используется для размещения маркера рядом с изображением размера "l".
 * @variant image-m Используется для размещения маркера рядом с изображением размера "m".
 * @variant image-s Используется для размещения маркера рядом с изображением размера "s".
 * @variant image-xs Используется для размещения маркера рядом с изображением размера "xs".
 * @variant text-2xl Используется для размещения маркера рядом с текстом размера "2xl".
 * @variant text-xl Используется для размещения маркера рядом с текстом размера "xl".
 * @variant text-l Используется для размещения маркера рядом с текстом размера "l".
 * @variant text-m Используется для размещения маркера рядом с текстом размера "m".
 * @variant text-xs Используется для размещения маркера рядом с текстом размера "xs".
 * @remark
 * На размер и положение маркера при настройке опции markerClassName также влияет размер отступа, настроенный в опции списка itemPadding.
 * see itemPadding
 */
export type TMarkerClassName = 'default' | 'image-l' | 'image-m' | 'image-s' | 'image-xl' |
    'text-2xl' | 'text-xl' | 'text-l' | 'text-m' | 'text-xs';

export interface ICollectionItem<S extends Model = Model> extends IInstantiable, IVersionable {
    getOwner(): ICollection<S, ICollectionItem>;
    setOwner(owner: ICollection<S, ICollectionItem>): void;

    /**
     * Получить представление текущего элемента
     * @function
     * @public
     * @return {Types/entity:Model} Опции записи
     */
    getContents(): S;
    setContents(contents: S, silent?: boolean): void;
    getUid(): string;
}
