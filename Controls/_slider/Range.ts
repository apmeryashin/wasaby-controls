import {IControlOptions, TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ISlider, ISliderOptions} from './interface/ISlider';
import SliderBase from './_SliderBase';
import SliderTemplate = require('wml!Controls/_slider/sliderTemplate');
import {IScaleData, ILineData, IPointDataList, default as Utils} from './Utils';
import { SyntheticEvent } from 'Vdom/Vdom';
import 'css!Controls/slider';
import {DimensionsMeasurer} from 'Controls/sizeUtils';

export interface ISliderRangeOptions extends IControlOptions, ISliderOptions {
   startValue: number;
   endValue: number;
}

const maxPercentValue = 100;

/**
 * Слайдер с двумя подвижными ползунками для выбора диапазона.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2fSlider%2fRange%2fIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_slider.less переменные тем оформления}
 *
 * @public
 * @extends UI/Base:Control
 * @class Controls/_slider/Range
 * @mixes Controls/slider:ISlider
 * @author Мочалов М.А.
 * @demo Controls-demo/Slider/Range/Base/Index
 */

/*
 * Slider with two movable points for choosing range.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2fSlider%2fRange%2fIndex">Demo-example</a>.
 * @public
 * @extends UI/Base:Control
 * @class Controls/_slider/Range
 * @mixes Controls/slider:ISlider
 * @author Мочалов М.А.
 * @demo Controls-demo/Slider/Range/Base/Index
 */

class Range extends SliderBase<ISliderRangeOptions> implements ISlider {
   protected _template: TemplateFunction = SliderTemplate;
   private _value: number = undefined;
   private _lineData: ILineData = undefined;
   private _pointData: IPointDataList = undefined;
   protected _scaleData: IScaleData[] = undefined;
   private _startValue: number = undefined;
   private _endValue: number = undefined;
   private _tooltipPosition: number | null = null;
   protected _tooltipValue: string | null = null;
   protected _isDrag: boolean = false;

   private _render(minValue: number, maxValue: number, startValue: number, endValue: number): void {
      const rangeLength = maxValue - minValue;
      const left =  Math.min(Math.max((startValue - minValue), 0), rangeLength) / rangeLength * maxPercentValue;
      const right =  Math.min(Math.max((endValue - minValue), 0), rangeLength) / rangeLength * maxPercentValue;
      const width = right - left;
      this._pointData[1].position = right;
      this._pointData[0].position = left;
      this._lineData.position = left;
      this._lineData.width = width ;
   }

   private _renderTooltip(minValue: number, maxValue: number, value: number): void {
      const rangeLength = maxValue - minValue;
      this._pointData[2].position =
          Math.min(Math.max(value - minValue, 0), rangeLength) / rangeLength * maxPercentValue;
   }

   private _checkOptions(opts: ISliderRangeOptions): void {
      Utils.checkOptions(opts);
      if (opts.startValue < opts.minValue || opts.startValue > opts.maxValue) {
         Logger.error('Slider', 'startValue must be in the range [minValue..maxValue].', this);
      }
      if (opts.endValue < opts.minValue || opts.endValue > opts.maxValue) {
          Logger.error('Slider', 'endValue must be in the range [minValue..maxValue].', this);
      }
      if (opts.startValue > opts.endValue) {
          Logger.error('Slider', 'startValue must be less than or equal to endValue.', this);
      }
   }

   private _needUpdate(oldOpts: ISliderRangeOptions, newOpts: ISliderRangeOptions): boolean {
      return (oldOpts.scaleStep !== newOpts.scaleStep ||
         oldOpts.minValue !== newOpts.minValue ||
         oldOpts.maxValue !== newOpts.maxValue ||
         oldOpts.startValue !== newOpts.startValue ||
         oldOpts.endValue !== newOpts.endValue);
   }

   protected _beforeMount(options: ISliderRangeOptions): void {
      super._beforeMount(options);
      this._checkOptions(options);
      this._scaleData = Utils.getScaleData(options.minValue, options.maxValue, options.scaleStep,
          options.scaleLabelFormatter);
      this._endValue = options.endValue === undefined ? options.maxValue : Math.min(options.maxValue, options.endValue);
      this._startValue = options.startValue === undefined ?
                                                options.minValue : Math.max(options.minValue, options.startValue);
      this._value = undefined;
      this._pointData = [
          {name: 'pointStart', position: 0}, {name: 'pointEnd', position: 100}, {name: 'tooltip', position: 0}
      ];
      this._lineData = {position: 0, width: 100};
      this._render(options.minValue, options.maxValue, this._startValue, this._endValue);
   }

   protected _beforeUpdate(options: ISliderRangeOptions): void {
      super._beforeUpdate(options);
      if (this._needUpdate(this._options, options)) {
         this._checkOptions(options);
         this._scaleData = Utils.getScaleData( options.minValue, options.maxValue, options.scaleStep,
             options.scaleLabelFormatter);
      }
      if (
          this._options.hasOwnProperty('startValue') &&
          this._options.hasOwnProperty('endValue')
      ) {
         this._endValue = options.endValue === undefined ?
             options.maxValue : Math.min(options.maxValue, options.endValue);
         this._startValue = options.startValue === undefined ?
             options.minValue : Math.max(options.minValue, options.startValue);
      } else {
         this._endValue = Math.min(options.maxValue, this._endValue);
         this._startValue = Math.max(options.minValue, this._startValue);
      }
      this._render(options.minValue, options.maxValue, this._startValue, this._endValue);
      this._renderTooltip(options.minValue, options.maxValue, this._tooltipPosition);
   }

   private _setStartValue(val: number): void {
      if (this._startValue !== val) {
         this._notify('startValueChanged', [val]);
         if (!this._options.hasOwnProperty('startValue')) {
            this._startValue = val;
         }
      }
   }
   private _setEndValue(val: number): void {
      if (this._endValue !== val) {
         this._notify('endValueChanged', [val]);
         if (!this._options.hasOwnProperty('endValue')) {
            this._endValue = val;
         }
      }
   }

   private _getClosestPoint(value: number, startValue: number, endValue: number): string {
      const startPointDistance = Math.abs(value - startValue);
      const endPointDistance = Math.abs(value - endValue);
      if (startPointDistance === endPointDistance) {
         return value < startValue ? 'start' : 'end';
      } else {
         return startPointDistance < endPointDistance ? 'start' : 'end';
      }
   }

   protected _mouseDownAndTouchStartHandler(event: SyntheticEvent<MouseEvent | TouchEvent>): void {
      if (!this._options.readOnly) {
         this._value = this._getValue(event);
         const pointName = this._getClosestPoint(this._value, this._startValue, this._endValue);
         if (pointName === 'start') {
            this._setStartValue(this._value);
         }
         if (pointName === 'end') {
            this._setEndValue(this._value);
         }
         const target = pointName === 'start' ? this._children.pointStart : this._children.pointEnd;
         this._children.dragNDrop.startDragNDrop(target, event);
      }
   }

   protected _onDragNDropHandler(e: SyntheticEvent<Event>, dragObject): void {
      if (!this._options.readOnly) {
         const box = this._children.area.getBoundingClientRect();
         const windowDimensions = DimensionsMeasurer.getWindowDimensions(e.target);
         const ratio = Utils.getRatio(dragObject.position.x, box.left + windowDimensions.pageXOffset, box.width);
         this._value = Utils.calcValue(this._options.minValue, this._options.maxValue, ratio, this._options.precision);
         if (dragObject.entity === this._children.pointStart) {
            this._setStartValue(Math.min(this._value, this._endValue));
         }
         if (dragObject.entity === this._children.pointEnd) {
            this._setEndValue(Math.max(this._value, this._startValue));
         }
      }
   }

   static getDefaultOptions(): object {
      return {...{
         theme: 'default',
         startValue: undefined,
         endValue: undefined
      }, ...SliderBase.getDefaultOptions()};

   }
   static getOptionTypes(): object {
      return {...{
         startValue: EntityDescriptor(Number),
         endValue: EntityDescriptor(Number)
      }, ...SliderBase.getOptionTypes()};

   }
}

Object.defineProperty(Range, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Range.getDefaultOptions();
   }
});

/**
 * @name Controls/_slider/Range#startValue
 * @cfg {Number} Устанавливает текущее начальное значение слайдера.
 * @remark Должно находиться в диапазоне [minValue..maxValue]
 * @example
 * Слайдер с первым ползунком, установленном в положение 40:
 * <pre class="brush:html">
 * <!-- WML -->
 * <Controls.slider:Base bind:startValue="_startValue"/>
 * </pre>
 * <pre class="brush:js">
 * // TypeScript
 * this._startValue = 40;
 * </pre>
 * @see endValue
 */

/*
 * @name Controls/_slider/Range#startValue
 * @cfg {Number} sets the current start value of slider
 * @remark Must be in range of [minValue..maxValue]
 * @example
 * Slider with the first point placed at position 40;
 * <pre class="brush:html">
 *   <Controls.slider:Base bind:startValue="_startValue"/>
 * </pre>
 * ts:
 * <pre>
 *    this._startValue = 40;
 * </pre>
 * @see endValue
 */

/**
 * @name Controls/_slider/Range#endValue
 * @cfg {Number} Устанавливает текущее конечное значение слайдера.
 * @remark Должно находится в диапазоне [minValue..maxValue]
 * @example
 * Слайдер со вторым ползунком, установленном в положение 40;
 * <pre class="brush:html">
 * <!-- WML -->
 * <Controls.slider:Base bind:endValue="_endValue"/>
 * </pre>
 * <pre class="brush:js">
 * // TypeScript
 * this._endValue = 40;
 * </pre>
 * @see startValue
 */

/*
 * @name Controls/_slider/Range#endValue
 * @cfg {Number} sets the current end value of slider
 * @remark Must be in range of [minValue..maxValue]
 * @example
 * Slider with the second point placed at position 40;
 * <pre class="brush:html">
 *   <Controls.slider:Base bind:endValue="_endValue"/>
 * </pre>
 * ts:
 * <pre>
 *    this._endValue = 40;
 * </pre>
 * @see startValue
 */

/**
 * @event Происходит при изменении начального значения слайдера.
 * @name Controls/_slider/Range#startValueChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Number} startValue Новое значение.
 */

/**
 * @event Происходит при изменении конечного значения слайдера.
 * @name Controls/_slider/Range#endValueChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Number} endValue Новое значение.
 */

export default Range;
