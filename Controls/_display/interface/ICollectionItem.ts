import {IInstantiable, IVersionable, Model} from 'Types/entity';
import {ICollection} from './ICollection';

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
