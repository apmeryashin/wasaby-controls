/**
 * Библиотека контролов для организации двухколоночных списков, в которых выбор элемента из первой колонки влияет на содержимое второй колонки.
 * @library
 * @includes Base Controls/_masterDetail/Base
 * @public
 * @author Герасимов А.М.
 */

/*
 * masterDetail library
 * @library
 * @includes Base Controls/_masterDetail/Base
 * @public
 * @author Герасимов А.М.
 */

import Base = require('wml!Controls/_masterDetail/WrappedBase');
export {
    Base
};
export {default as List} from 'Controls/_masterDetail/List';
export {TMasterVisibility, IMasterWidth} from 'Controls/_masterDetail/Base';
