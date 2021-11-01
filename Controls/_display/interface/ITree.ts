import {TIconSize, TIconStyle} from 'Controls/interface';

/**
 * @typedef {String} Controls/_display/interface/ITree/TExpanderIconSize
 * @description Тип значений для настройки размеров иконки разворота узла
 * @variant 2xs Малые иконки разворота узла
 * @variant default Размера иконок по умолчанию
 */
export type TExpanderIconSize = Extract<TIconSize, '2xs' | 'default'>;

/**
 * @typedef {String} Controls/_display/interface/ITree/TExpanderIconStyle
 * @description Тип значений для настройки стиля цвета иконки разворота узла
 * @variant unaccented Неакцентный цвет иконки разворота узла
 * @variant default Цвет иконки разворота узла по умолчанию
 */
export type TExpanderIconStyle = Extract<TIconStyle, 'unaccented' | 'default'>;
