import template = require('wml!Controls/_popupTemplate/ResizingArrow/ResizingArrow');
import {ResizingBase, IDragObject, IResizingBase} from 'Controls/dragnDrop';
import {TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/dragnDrop';
import 'css!Controls/popupTemplate';

interface IOffsetValue {
    style: string;
    value: number;
}

interface IOffset {
    x: IOffsetValue;
    y: IOffsetValue;
}

interface IStyleArea {
    horizontalStyle?: string;
    verticalStyle?: string;
    width?: string;
    height?: string;
    widthStyle?: string;
    heightStyle?: string;
}

interface IDragObjectOffset {
    x?: number;
    y?: number;
}

/**
 * Контрол, позволяющий визуально отображать процесс изменения других контролов при помощи перемещения мышью по правой нижней границе
 * @remark
 * Родительские DOM элементы не должны иметь overflow: hidden. В противном случае корректная работа не гарантируется.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/drag-n-drop/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dragnDrop.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/ResizingArrow
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/_popupTemplate/ResizingArrow/Index
 */
class ResizingArrow extends ResizingBase<IResizingBase> {
    protected _template: TemplateFunction = template;
    protected _styleArea: IStyleArea = {};

    protected _onDragHandler(event: SyntheticEvent<MouseEvent>, dragObject: IDragObject): void {
        this.drag(dragObject.offset);
        dragObject.entity.offset = this._offset(dragObject.offset);
    }

    protected _getEntityOffset(dragObject: IDragObject): object {
        return {
            x: dragObject.entity.offset.x.value,
            y: dragObject.entity.offset.y.value
        };
    }

    protected _clearStyleArea(): void {
        this._styleArea = {};
    }

    drag(dragObjectOffset: IDragObjectOffset): void {
        const offset = this._offset(dragObjectOffset);
        const xValue = offset.x.value;
        const yValue = offset.y.value;

        let horizontalStyle: string;
        let verticalStyle: string;
        if (xValue > 0) {
            horizontalStyle = `width: calc( 100% + ${xValue}px); height: ${Math.abs(yValue)}px;` + offset.y.style;
        } else {
            horizontalStyle = `width: 100%; height: ${Math.abs(yValue)}px;` + offset.y.style;
        }

        if (yValue > 0) {
            verticalStyle = `height: 100%; width: ${Math.abs(xValue)}px;` + offset.x.style;
        } else {
            verticalStyle = `height: calc( 100% + ${yValue}px); width: ${Math.abs(xValue)}px;` + offset.x.style;
        }

        this._styleArea = {
            horizontalStyle,
            verticalStyle
        };
    }

    private _offsetValue(val: number, position: string[]): IOffsetValue {
        const {minOffset, maxOffset} = this._options;
        if (val > 0) {
            return {
                style: `${position[0]}: 100%;${position[1]}: auto`,
                value: Math.min(val, Math.abs(maxOffset))
            };
        }
        if (val < 0) {
            return {
                style: `${position[1]}: 0; ${position[0]}: auto`,
                value: -Math.min(-val, Math.abs(minOffset))
            };
        }
        return {
            style: '',
            value: 0
        };
    }

    protected _offset(offset: IDragObjectOffset): IOffset {
        return {
            x: this._offsetValue(offset.x, ['left', 'right']),
            y: this._offsetValue(offset.y, ['top', 'bottom'])
        };
    }

    static defaultProps: IResizingBase = ResizingBase.getDefaultOptions();
}

/**
 * @typedef {Object} EventOffset
 * @property {number} x Смещение по оси X
 * @property {number} y Смещение по оси Y
 */

/**
 * @event Происходит после перетаскивания мыши, когда клавиша мыши отпущена.
 * @name Controls/_popupTemplate/ResizingArrow#offset
 * @param {EventOffset} offset Значение сдвига
 */

export default ResizingArrow;
