import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {IIndicatorCategory} from './StateIndicator';
import legendTemplate = require('wml!Controls/_progress/Legend/Legend');
import 'css!Controls/progress';

/**
 * Интерфейс опций для {@link Controls/progress:Legend}.
 * @interface Controls/progress:ILegend
 * @public
 * @author Мочалов М.А.
 */
export interface ILegendOptions extends IControlOptions {
   /**
    * @name Controls/progress:ILegend#data
    * @cfg {Array.<Controls/progress:IndicatorCategory>} Конфигурация элементов легенды.
    * @example
    * <pre class="brush:html">
    * <!-- WML -->
    * <Controls.progress:Legend data="{{[{value: 10, className: '', title: 'done'}]}}"/>
    * </pre>
    * @remark
    * Используется, если для диаграммы нужно установить несколько легенд. Количество элементов массива задает количество легенд диаграммы.
    */
   data?: IIndicatorCategory[];
}
/**
 * Контрол используют для создания легенды к диаграмме состояния процесса (см. {@link /docs/js/Controls/progress/StateIndicator/?v=20.2000 Controls/progress:StateIndicator}).
 * Отображение легенды можно настроить во всплывающем окне при наведении курсора мыши на диаграмму состояния процесса.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_progress.less переменные тем оформления}
 *
 * @author Мочалов М.А.
 * @implements Controls/progress:ILegend
 * @public
 */

/*
 * Legend for StateIndicator
 * @class Controls/_progress/Legend
 * @author Мочалов М.А.
 */
class Legend extends Control<ILegendOptions> {
   protected _template: TemplateFunction = legendTemplate;

   static getOptionTypes(): object {
      return {
         data: EntityDescriptor(Array)
      };
   }

   static getDefaultOptions(): object {
      return {
         theme: 'default',
         data: [{value: 0, className: '', title: ''}]
      };
   }
}

Object.defineProperty(Legend, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Legend.getDefaultOptions();
   }
});

export default Legend;
