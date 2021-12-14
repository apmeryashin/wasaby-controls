import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/ResizingArrow/ResizingArrow');
import {SyntheticEvent} from 'Vdom/Vdom';

class ResizingLine extends Control<IControlOptions> {
    private _x: number = 100;
    private _y: number = 100;

    protected _template: TemplateFunction = controlTemplate;

    protected _offsetHandler(event: SyntheticEvent<Event>, offset: object): void {
        const valueX = this._x + offset.x;
        const valueY = this._y + offset.y;

        this._x = ResizingLine._limit(valueX);
        this._y = ResizingLine._limit(valueY);
    }

    private static MIN_WIDTH: number = 100;
    private static MAX_WIDTH: number = 300;

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/ResizingArrow/ResizingArrow'];

    private static _limit(value: number): number {
        return  Math.max(ResizingLine.MIN_WIDTH, Math.min(value, ResizingLine.MAX_WIDTH));
    }
}

export default ResizingLine;
