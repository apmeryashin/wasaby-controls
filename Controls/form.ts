/**
 * Библиотека контролов для работы с формами.
 * @library
 * @public
 * @author Крайнов Д.О.
 */

/*
 * form library
 * @library
 * @public
 * @author Крайнов Д.О.
 */

export {default as PrimaryAction} from './_form/PrimaryAction';
export {default as Controller, INITIALIZING_WAY, IResultEventData} from './_form/FormController';
export {default as ControllerBase} from './_form/ControllerBase';
export {default as CrudController, CRUD_EVENTS} from './_form/CrudController';
export {default as IFormController} from './_form/interface/IFormController';
export {default as IControllerBase, IUpdateConfig} from './_form/interface/IControllerBase';
