import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IExpandableOptions, IExpandable} from 'Controls/interface';
import ButtonTemplate = require('wml!Controls/_operations/Button/Button');
export interface IOperationsButtonOptions extends IControlOptions, IExpandableOptions {
}

/**
 * Контрол-кнопка, использующийся для показа и скрытия панели действий {@link Controls/operations:Panel}.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/operations/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_operations.less">переменные тем оформления</a>
 *
 * @class Controls/_operations/Button
 * @extends Core/Control
 * @implements Controls/_interface/IExpandable
 * @control
 * @author Авраменко А.С.
 * @public
 *
 */

/*
 * Control for changing the extensibility of the "Controls/_operations/Panel".
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/operations/'>here</a>.
 *
 * @class Controls/_operations/Button
 * @extends Core/Control
 * @implements Controls/_interface/IExpandable
 * @control
 * @author Авраменко А.С.
 * @public
 *
 */

class OperationsButton extends Control<IOperationsButtonOptions> implements IExpandable {
   '[Controls/_toggle/interface/IExpandable]': true;
   // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
   protected _template: TemplateFunction = ButtonTemplate;

   protected _onClick(): void {
      if (!this._options.readOnly) {
         this._notify('expandedChanged', [!this._options.expanded]);
      }
   }
   static _theme: string[] = ['Controls/operations'];
}
export default OperationsButton;
