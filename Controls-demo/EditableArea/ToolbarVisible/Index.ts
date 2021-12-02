import {Record} from 'Types/entity';
import {main as editingObject} from '../Data';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls-demo/EditableArea/ToolbarVisible/ToolbarVisible';

class ToolbarVisible extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editingObject: Record = editingObject;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ToolbarVisible;
