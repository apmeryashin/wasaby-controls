import template = require('wml!Controls/_dragnDrop/ResizingLine/ResizingLine');
import {descriptor} from 'Types/entity';
import {IDragObject} from 'Controls/dragnDrop';
import {TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IResizingLine} from 'Controls/_dragnDrop/interface/IResizingLine';
import ResizingBase from 'Controls/_dragnDrop/ResizingBase';
import 'css!Controls/dragnDrop';

interface IOffset {
    style: string;
    value: number;
}

const enum ORIENTATION {
    VERTICAL = 'vertical',
    HORIZONTAL = 'horizontal'
}

/**
 * Контрол, позволяющий визуально отображать процесс изменения других контролов при помощи перемещения мышью
 * @remark
 * Родительские DOM элементы не должны иметь overflow: hidden. В противном случае корректная работа не гарантируется.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/drag-n-drop/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dragnDrop.less переменные тем оформления}
 *
 * @class Controls/_dragnDrop/ResizingLine
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/ResizingLine/Index
 */
class ResizingLine extends ResizingBase<IResizingLine> {
    protected _template: TemplateFunction = template;
    protected _styleArea: string = '';

    protected _onDragHandler(event: SyntheticEvent<MouseEvent>, dragObject: IDragObject): void {
        const offset = this._options.orientation === ORIENTATION.HORIZONTAL ? dragObject.offset.x : dragObject.offset.y;
        this.drag(offset);
        dragObject.entity.offset = this._offset(offset);
    }

    protected _clearStyleArea(): void {
        this._styleArea = '';
    }

    protected _getEntityOffset(dragObject: IDragObject): Object | number {
        return dragObject.entity.offset.value;
    }

    drag(dragObjectOffset: number): void {
        const styleSizeName = this._options.orientation === ORIENTATION.HORIZONTAL ? 'width' : 'height';

        const offset = this._offset(dragObjectOffset);
        const sizeValue = `${Math.abs(offset.value)}px`;

        this._styleArea = `${styleSizeName}:${sizeValue};${offset.style};`;
    }

    protected _offset(x: number): IOffset {
        const {direction, minOffset, maxOffset} = this._options;
        let position;
        if (this._options.orientation === ORIENTATION.HORIZONTAL) {
            position = ['left', 'right'];
        } else {
            position = ['top', 'bottom'];
        }

        if (x > 0 && direction === 'direct') {
            return {
                style: `${position[0]}: 100%`,
                value: Math.min(x, Math.abs(maxOffset))
            };
        }
        if (x > 0 && direction === 'reverse') {
            return {
                style: `${position[0]}: 0`,
                value: -Math.min(x, Math.abs(minOffset))
            };
        }
        if (x < 0 && direction === 'direct') {
            return {
                style: `${position[1]}: 0`,
                value: -Math.min(-x, Math.abs(minOffset))
            };
        }
        if (x < 0 && direction === 'reverse') {
            return {
                style: `${position[1]}: 100%`,
                value: Math.min(-x, Math.abs(maxOffset))
            };
        }

        return {
            style: '',
            value: 0
        };
    }

    static defaultProps: IResizingLine = {
        ...ResizingBase.getDefaultOptions(),
        direction: 'direct',
        orientation: 'horizontal'
    };

    static getDefaultTypes(): object {
        return {
            ...ResizingBase.getDefaultTypes(),
            direction: descriptor(String).oneOf([
                'direct',
                'reverse'
            ]),
            orientation: descriptor(String).oneOf([
                'vertical',
                'horizontal'
            ])
        };
    }
}

export default ResizingLine;
