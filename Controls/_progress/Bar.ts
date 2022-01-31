import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import * as Utils from 'Controls/_progress/Utils';

import barTemplate = require('wml!Controls/_progress/Bar/Bar');
import 'css!Controls/progress';

export interface IBarOptions extends IControlOptions {
   value?: number;
   barStyle: 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'info';
   blankAreaStyle?: 'default' | 'none' | 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'info';
}
/**
 * Базовый индикатор выполнения процесса.
 * Отображает полосу прогресса выполнения.
 * @class Controls/_progress:Bar
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2fprogress%2fBar%2fIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-21.6000/Controls-default-theme/variables/_progress.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @implements Controls/progress:IBar
 * @author Мочалов М.А.
 *
 * @public
 *
 * @demo Controls-demo/progress/Bar/Base/Index
 *
 */

/*
 * Control that renders progress bar
 * @class Controls/_progress:Bar
 * @extends UI/Base:Control
 * @author Мочалов М.А.
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
      const value = Utils.isNumeric(val) ? val : 0;
      Utils.isValueInRange(value, 0, maxPercentValue, 'Bar', 'Value');
      return (value > 0 ? Math.min(value, maxPercentValue) + '%' : '0px');
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

/**
 * @name Controls/_progress:Bar#value
 * @cfg {Number} Значение прогресса в процентах.
 * @remark
 * Целое число от 0 до 100.
 */

/*
* @name Controls/_progress:Bar#value
* @cfg {Number} Progress in percents (ratio of the filled part)
* @remark
* An integer from 1 to 100.
*/

/**
 * @name Controls/_progress:Bar#barStyle
 * @cfg {String} Стиль шкалы прогресс бара.
 * @variant primary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant secondary
 * @variant info
 * @default primary
 * @demo Controls-demo/progress/Bar/BarStyle/Index
 */

/**
 * @name Controls/_progress:Bar#blankAreaStyle
 * @cfg {String} Стиль шкалы не заполненной области прогресс бара.
 * @variant default
 * @variant none
 * @variant primary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant secondary
 * @variant info
 * @default default
 * @demo Controls-demo/progress/Bar/BlankAreaStyle/Index
 */
export default Bar;
