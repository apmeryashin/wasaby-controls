import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/PropertyGridNew/Group/Expander/Expander';
import {getEditingObject, getSource} from 'Controls-demo/PropertyGridNew/resources/Data';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _editingObject: object = null;
    protected _typeDescription: object[] = null;

    protected _beforeMount(): void {
        this._editingObject = getEditingObject();
        this._typeDescription = getSource();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
