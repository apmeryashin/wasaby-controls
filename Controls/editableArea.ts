/**
 * Библиотека контролов, которые служат для отображения данных с возможностью редактирования.
 * @library
 * @includes View Controls/_editableArea/View
 * @includes Base Controls/_editableArea/Templates/Editors/Base
 * @includes DateTime Controls/_editableArea/Templates/Editors/DateTime
 * @includes Buttons Controls/_editableArea/Templates/Buttons
 * @includes IView Controls/_editableArea/interface/IView
 * @public
 * @author Мочалов М.А.
 */

/*
 * editableArea library
 * @library
 * @includes View Controls/_editableArea/View
 * @includes Base Controls/_editableArea/Templates/Editors/Base
 * @includes DateTime Controls/_editableArea/Templates/Editors/DateTime
 * @public
 * @author Мочалов М.А.
 */

export {default as View} from './_editableArea/View';
export {default as Base} from './_editableArea/Templates/Editors/Base';
export {default as DateTime} from './_editableArea/Templates/Editors/DateTime';
export {default as Buttons} from './_editableArea/Templates/Buttons';
export {IView, IViewOptions} from './_editableArea/interface/IView';
