import {Record} from 'Types/entity';
import {main as editingObject} from '../Data';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls-demo/EditableArea/BackgroundStyle/BackgroundStyle';

class BackgroundStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editingObject: Record = editingObject;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/EditableArea/BackgroundStyle/BackgroundStyle'];
}
export default BackgroundStyle;
