import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import * as Utils from 'Controls/_progress/Utils';
import stateIndicatorTemplate = require('wml!Controls/_progress/StateIndicator/StateIndicator');
import { SyntheticEvent } from 'Vdom/Vdom';
import 'css!Controls/progress';

const defaultColors = [
   'controls-StateIndicator__sector1',
   'controls-StateIndicator__sector2',
   'controls-StateIndicator__sector3'
];
const defaultScaleValue = 10;
const maxPercentValue = 100;

/**
 * Интерфейс опций для конфигурации категорий.
 * @interface Controls/progress:IIndicatorCategory
 * @public
 * @author Мочалов М.А.
 */
export interface IIndicatorCategory {
   /**
    * @name Controls/progress:IIndicatorCategory#value
    * @cfg {Number} Процент от соответствующей категории.
    * @default 0
    */
   /* Percents of the corresponding category */
   value: number;
   /**
    * @name Controls/progress:IIndicatorCategory#className
    * @cfg {String} Имя css-класса, который будет применяться к секторам этой категории. Если не указано, будет использоваться цвет по умолчанию.
    * @default ''
    */
   /*Name of css class, that will be applied to sectors of this category.
   If not specified, default color will be used */
   className: string;
   /**
    * @name Controls/progress:IIndicatorCategory#title
    * @cfg {String} Название категории.
    * @default ''
    */
   /* category note */
   title: string;
}

/**
 * Интерфейс опций для {@link Controls/progress:StateIndicator}.
 * @interface Controls/progress:IStateIndicator
 * @public
 * @author Мочалов М.А.
 */
export interface IStateIndicatorOptions extends IControlOptions {
   /**
    * @name Controls/progress:IStateIndicator#scale
    * @cfg {Number} Определяет размер (процентное значение) одного сектора диаграммы.
    * @remark
    * Положительное число до 100.
    * @example
    * Шкала из 5 установит индикатор с 20-ю секторами.
    * <pre class="brush:html">
    * <!-- WML -->
    * <Controls.progress:StateIndicator scale="{{5}}"/>
    * </pre>
    */

   /*
   * @name Controls/progress:IStateIndicator#scale
   * @cfg {Number} Defines percent count shown by each sector.
   * @remark
   * A positive number up to 100.
   * @example
   * Scale of 5 will set indicator with 20 sectors
   * <pre class="brush:html">
   * <!-- WML -->
   * <Controls.progress:StateIndicator scale="{{5}}"/>
   * </pre>
   */
   scale?: number;
   /**
    * @name Controls/progress:IStateIndicator#data
    * @cfg {Array.<Controls/progress:IIndicatorCategory>} Массив категорий диаграммы.
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.progress:StateIndicator data="{{[{value: 10, className: '', title: 'done'}]}}"/>
    * </pre>
    * @remark
    * Используется, если для диаграммы нужно установить несколько категорий. Количество элементов массива задает количество категорий диаграммы.
    */

   /*
   * @name Controls/progress:IStateIndicator#data
   * @cfg {Array.<Controls/progress:IIndicatorCategory>} Array of indicator categories
   * @example
   * <pre class="brush:html">
   * <!-- WML -->
   * <Controls.progress:StateIndicator data="{{[{value: 10, className: '', title: 'done'}]}}"/>
   * </pre>
   */
   data?: IIndicatorCategory[];
}
/**
 * Диаграмма состояния процесса.
 * Позволяет получить наглядную информацию по состоянию выполнения некоторого процесса в разрезе нескольких категорий.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2fprogress%2fStateIndicator%2fIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_progress.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @implements Controls/progress:IStateIndicator
 * @author Мочалов М.А.
 *
 * @public
 * @demo Controls-demo/progress/StateIndicator/Base/Index
 */

/*
 * Progress state indicator
 * {@link /materials/Controls-demo/app/Controls-demo%2fprogress%2fStateIndicator%2fIndex демо-пример}.
 * @class Controls/_progress/StateIndicator
 * @extends UI/Base:Control
 * @author Мочалов М.А.
 *
 * @public
 * @demo Controls-demo/progress/StateIndicator/Base/Index.ts
 */
class StateIndicator extends Control<IStateIndicatorOptions> {
   protected _template: TemplateFunction = stateIndicatorTemplate;
   protected _colorState: number[];
   private _colors: string[];
   private _numSectors: number = 10;
   private _percentageDifferences: number[] = [];

   private _checkData(opts: IStateIndicatorOptions): void {
      Utils.isNumeric(opts.scale, 'StateIndicator', 'Scale');
      Utils.isValueInRange(opts.scale, 1, maxPercentValue, 'StateIndicator', 'Scale');
      Utils.isSumInRange(opts.data, maxPercentValue, 'StateIndicator');
   }

   private _setColors(data: IIndicatorCategory[]): string[] {
      const colors: string[] = [];
      for (let i = 0; i < data.length; i++) {
         colors[i] = data[i].className ? data[i].className : (defaultColors[i] ? defaultColors[i] : '');
      }
      return colors;
   }

   private _calculateColorState(opts: IStateIndicatorOptions, _colors: string[], _numSectors: number): number[] {
      const colorValues = [];
      let correctScale: number = opts.scale;
      let curSector = 0;
      let totalSectorsUsed = 0;
      let maxSectorsPerValue = 0;
      let longestValueStart;
      let itemValue;
      let itemNumSectors;
      let excess;
      this._percentageDifferences = [];

      if (!Utils.isValueInRange(opts.scale, 1, maxPercentValue)) {
         correctScale = defaultScaleValue;
      }
      for (let i = 0; i < Math.min(opts.data.length); i++) {
         // do not draw more colors, than we know
         if (i < _colors.length) {
            // convert to number, ignore negative ones
            itemValue = Math.max(0, + opts.data[i].value || 0);
            itemNumSectors = Math.floor(itemValue / correctScale);
            const percentageDeviation = itemValue - correctScale * itemNumSectors;
            this._percentageDifferences.push(percentageDeviation);
            if (itemValue > 0 && itemNumSectors === 0) {
               // if state value is positive and corresponding sector number is 0, increase it by 1 (look specification)
               itemNumSectors = 1;
            }
            if (itemNumSectors > maxSectorsPerValue) {
               longestValueStart = curSector;
               maxSectorsPerValue = itemNumSectors;
            }
            totalSectorsUsed += itemNumSectors;
            for (let j = 0; j < itemNumSectors; j++) {
               colorValues[curSector++] = i + 1;
            }
         }
      }
      // if we count more sectors, than we have in indicator, trim the longest value
      if (totalSectorsUsed  > _numSectors ) {
         excess = totalSectorsUsed - _numSectors;
         totalSectorsUsed -= excess;
         colorValues.splice(longestValueStart, excess);
      }
      let sum: number = 0;
      opts.data.forEach((item) => {
         sum += item.value;
      });
      // Если сумма значений равна 100%, но при этом мы получили меньше секторов, то будем
      // прибавлять сектор к такому элементу, у которого процентное отклонение больше остальных.
      if (totalSectorsUsed < _numSectors && sum === maxPercentValue) {
         while (totalSectorsUsed !== _numSectors) {
            const maxDeviationIndex = this._getMaxPercentageDeviationIndex();
            colorValues.splice(colorValues.indexOf(maxDeviationIndex + 1), 0,  maxDeviationIndex + 1);
            totalSectorsUsed++;
            this._percentageDifferences[maxDeviationIndex] -= correctScale;
         }
      } else if (sum !== maxPercentValue && totalSectorsUsed === _numSectors) {
         // При округлении в расчетах может быть ситуация, когда все сектора заполнены,
         // но сумма не равна максимальной, в этом случае 1 сектор оставляем пустым
         colorValues.splice(longestValueStart, 1);
      }
      return colorValues;
   }

   private _getMaxPercentageDeviationIndex(): number {
      let maxDeviation = this._percentageDifferences[0];
      let maxDeviationIndex = 0;
      for (let i = 1; i < this._percentageDifferences.length; i++) {
         if (this._percentageDifferences[i] > maxDeviation) {
            maxDeviation = this._percentageDifferences[i];
            maxDeviationIndex = i;
         }
      }
      return maxDeviationIndex;
   }

   private _applyNewState(opts: IStateIndicatorOptions): void {
      let correctScale: number = opts.scale;
      this._checkData(opts);
      if (!Utils.isValueInRange(opts.scale, 1, maxPercentValue)) {
         correctScale = defaultScaleValue;
      }
      this._numSectors = Math.floor(maxPercentValue / correctScale);
      this._colors = this._setColors(opts.data);
      this._colorState  = this._calculateColorState(opts, this._colors, this._numSectors);
   }

   protected _mouseEnterIndicatorHandler(e: SyntheticEvent<MouseEvent>): void {
      this._notify('itemEnter', [e.target]);
   }

   protected _beforeMount(opts: IStateIndicatorOptions): void {
      this._applyNewState(opts);
   }

   protected _beforeUpdate(opts: IStateIndicatorOptions): void {
      if (opts.data !== this._options.data || opts.scale !== this._options.scale) {
         this._applyNewState(opts);
      }
   }

   static getDefaultOptions(): object {
      return {
         theme: 'default',
         scale: 10,
         data: [{value: 0, title: '', className: ''}],
         sectorSize: 'm'
      };
   }

   static getOptionTypes(): object {
      return {
         scale: EntityDescriptor(Number),
         data: EntityDescriptor(Array),
         sectorSize: EntityDescriptor(String)
      };
   }
}

Object.defineProperty(StateIndicator, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return StateIndicator.getDefaultOptions();
   }
});

/**
 * @name Controls/_progress/StateIndicator#sectorSize
 * @cfg {String} Размер одного сектора диаграммы.
 * @variant s
 * @variant m
 * @variant l
 * @default m
 * @demo Controls-demo/progress/StateIndicator/SectorSize/Index
 */

/**
 * @event Происходит при наведении курсора мыши на диаграмму.
 * @name Controls/_progress/StateIndicator#itemEnter
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Node} target Элемент, на котоорый навели курсор мыши
 *
 */

/*
 * @event Occurs when mouse enters sectors of indicator
 * @name Controls/_progress/StateIndicator#itemEnter
 * @param {UICommon/Events:SyntheticEvent} eventObject event descriptor.
 *
 */
export default StateIndicator;
