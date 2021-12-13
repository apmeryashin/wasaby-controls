import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/Scroll/StickyBlock/StickyGroup/HorizontalStackable/HorizontalStackable';

export default class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
