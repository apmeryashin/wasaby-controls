import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {Logger} from 'UI/Utils';
import barTemplate = require('wml!Controls/_progress/Bar/Bar');
import 'css!Controls/progress';

/**
 * Интерфейс опций для {@link Controls/progress:Bar}.
 * @interface Controls/progress:IBar
 * @public
 * @author Колесов В.А.
 */
export interface IBarOptions extends IControlOptions {
   /**
    * @name Controls/progress:IBar#value
    * @cfg {Number} Значение прогресса в процентах.
    * @remark
    * Целое число от 0 до 100.
    */

   /*
   * @name Controls/progress:IBar#value
   * @cfg {Number} Progress in percents (ratio of the filled part)
   * @remark
   * An integer from 1 to 100.
   */
   value?: number;
   /**
    * @name Controls/progress:IBar#barStyle
    * @cfg {String} Стиль шкалы прогресс бара.
    * @variant primary
    * @variant success
    * @variant warning
    * @variant danger
    * @variant secondary
    * @default primary
    * @demo Controls-demo/progress/Bar/BarStyle/Index
    */
   barStyle: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
   /**
    * @name Controls/progress:IBar#blankAreaStyle
    * @cfg {String} Стиль шкалы не заполненной области прогресс бара.
    * @variant default
    * @variant none
    * @default default
    * @demo Controls-demo/progress/Bar/BlankAreaStyle/Index
    */
   blankAreaStyle?: 'default' | 'none';
}
/**
 * Базовый индикатор выполнения процесса.
 * Отображает полосу прогресса выполнения.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2fprogress%2fBar%2fIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_progress.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @implements Controls/progress:IBar
 * @author Колесов В.А.
 *
 * @public
 *
 * @demo Controls-demo/progress/Bar/Base/Index
 *
 */

/*
 * Control that renders progress bar
 * @class Controls/_progress/Bar
 * @extends UI/Base:Control
 * @author Колесов В.А.
 *
 * @public
 *
 * @demo Controls-demo/progress/Bar/Index
 *
 */

class Bar extends Control<IBarOptions> {
   protected _template: TemplateFunction = barTemplate;
   protected _width: string = '0px';

   private _getWidth(val: number): string {
      const maxPercentValue = 100;
      if (val < 0 || val > maxPercentValue) {
         Logger.error('Bar: The value must be in range of [0..100]', this);
      }
      return (val > 0 ? Math.min(val, maxPercentValue) + '%' : '0px');
   }

   protected _beforeMount(opts: IBarOptions): void {
      this._width = this._getWidth(opts.value);
   }

   protected _beforeUpdate(opts: IBarOptions): void {
      this._width = this._getWidth(opts.value);
   }

   static getDefaultOptions(): object {
      return {
         theme: 'default',
         value: 0,
         barStyle: 'primary',
         blankAreaStyle: 'default'
      };
   }

   static getOptionTypes(): object {
      return {
         value: EntityDescriptor(Number).required(),
         barStyle: EntityDescriptor(String)
      };
   }
}

Object.defineProperty(Bar, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Bar.getDefaultOptions();
   }
});

export default Bar;
