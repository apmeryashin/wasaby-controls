/**
 * Библиотека контролов для организации двухколоночных списков, в которых выбор элемента из первой колонки влияет на содержимое второй колонки.
 * @library
 * @public
 * @author Авраменко А.С.
 */

/*
 * masterDetail library
 * @library
 * @public
 * @author Авраменко А.С.
 */

import Base = require('wml!Controls/_masterDetail/WrappedBase');
export {
    Base
};
export {default as List} from 'Controls/_masterDetail/List';
