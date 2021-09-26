import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Masks/Masks');

class Masks extends Control<IControlOptions> {
    protected _value1: string;
    protected _value2: string;
    protected _value3: string = '';
    protected _template: TemplateFunction = controlTemplate;
    //protected _masks = 'LL dd dd ddddd';

    //protected _masks = ['L dd d', 'L dddd LL ddd', 'L ddd LL', 'L dddd dd', 'L ddd dddd'];
    //protected _masks = ['L dd d', 'L ddd ddd', 'L dd dd dd ddd', 'L d ddd ddd'];
    protected _masks = ['L dd d', 'L ddd ddd', 'L dd dd dd ddd', 'L d ddd ddd', 'xxxxxxxxxxxxxxxxxxxx'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Masks;
