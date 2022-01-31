/**
 * Библиотека контролов, которые позволяют организовать <a href="/doc/platform/developmentapl/interface-development/forms-and-validation/validation/">валидацию</a> данных на форме.
 * @library
 * @includes Controller Controls/_validate/Controller
 * @includes ControllerClass Controls/_validate/ControllerClass
 * @includes Container Controls/_validate/Container
 * @includes InputContainer Controls/_validate/InputContainer
 * @includes Highlighter Controls/validate:Highlighter
 * @includes isEmail Controls/_validate/Validators/IsEmail
 * @includes isRequired Controls/_validate/Validators/IsRequired
 * @includes isValidDate Controls/_validate/Validators/IsValidDate
 * @includes IsValidDateRange Controls/_validate/Validators/IsValidDateRange
 * @includes inRange Controls/_validate/Validators/InRange
 * @includes inDateRange Controls/_validate/Validators/InDateRange
 * @includes DateRangeContainer Controls/_validate/DateRange
 * @includes SelectionContainer Controls/_validate/SelectionContainer
 * @includes IValidateResult Controls/_validate/interfaces/IValidateResult
 * @public
 * @author Мочалов М.А.
 */

import isValidDate from 'Controls/_validate/Validators/IsValidDate';
import isValidDateRange from 'Controls/_validate/Validators/IsValidDateRange';
import * as Highlighter from 'wml!Controls/_validate/Highlighter';

export {default as isEmail} from 'Controls/_validate/Validators/IsEmail';
export {default as isRequired} from 'Controls/_validate/Validators/IsRequired';
export {default as inDateRange} from 'Controls/_validate/Validators/InDateRange';
export {default as inRange} from 'Controls/_validate/Validators/InRange';
export {default as Controller} from 'Controls/_validate/Controller';
export {default as ControllerClass} from 'Controls/_validate/ControllerClass';
export {default as Container} from 'Controls/_validate/Container';
export {default as InputContainer} from 'Controls/_validate/InputContainer';
export {default as DateRangeContainer} from 'Controls/_validate/DateRange';
export {default as SelectionContainer} from 'Controls/_validate/SelectionContainer';
export {default as IValidateResult} from 'Controls/_validate/interfaces/IValidateResult';

export {
    isValidDate,
    isValidDateRange,
    Highlighter
};
