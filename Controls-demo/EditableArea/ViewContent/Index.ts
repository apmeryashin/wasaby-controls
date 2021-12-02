import {Record} from 'Types/entity';
import {main as editingObject, date as editingObjectRange} from '../Data';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls-demo/EditableArea/ViewContent/ViewContent';

class ViewContent extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editingObject: Record = editingObject;
    protected _editingObjectRange: Record = editingObjectRange;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewContent;
