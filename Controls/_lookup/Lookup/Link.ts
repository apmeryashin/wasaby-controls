import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_lookup/Lookup/Link/LookUp_Link';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/lookup';

/**
 * Кнопка-ссылка для использования внутри подсказки поля связи.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_lookup.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @implements Controls/interface:ICaption
 * @implements Controls/interface:IHeight
 * @implements Controls/interface:IUnderline
 *
 * @demo Controls-demo/Lookup/MultipleInputNew/MultipleInputNew
 *
 * @public
 * @author Герасимов А.М.
 */

export default class Link extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   protected _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
      if (e.nativeEvent.keyCode === 13 && !this._options.readOnly) {
         this._notify('click');
      }
   }

   protected  _clickHandler(e: SyntheticEvent<MouseEvent>): void {
      /* toDo !KINGO Cаггест при установленной опции autoDropDown покажется при клике,
          поэтому отменяем всплытие нативного события, и стреляем не всплывающим событием, что бы прикладник смог
          подписаться и показать справочник. Всплытие тут не нужно, т.к. метка лежит только в подсказке поля связи.
       */
      e.stopPropagation();

      if (!this._options.readOnly) {
         this._notify('click');
      }

      if (this._options.lookupName) {
         this._notify('showSelector', [this._options.lookupName], {bubbling: true});
      }
   }

   static defaultProps: object = {
      fontSize: 'lookupLink',
      underline: 'fixed'
   };
}
