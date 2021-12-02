import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IItemAction, TItemActionShowType} from 'Controls/itemActions';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {default as IPropertyGridItem} from 'Controls/_propertyGrid/IProperty';

import * as template from 'wml!Controls-demo/PropertyGridNew/AddInPlace/GridRender/GridRender';

export default class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editingObject: Model;
    protected _typeDescription: RecordSet;
    protected _itemActions: IItemAction[];
    private _fakeItemId: number = 0;

    protected _beforeMount(): void {
        this._editingObject = new Model<IPropertyGridItem>({
            rawData: {
                string: 'Значение',
                dynamicString: 'Значение'
            }
        });
        this._typeDescription = new RecordSet<IPropertyGridItem>({
            rawData: [
                {
                    caption: 'Статическое свойство',
                    name: 'string',
                    editorTemplateName: 'Controls/propertyGrid:StringEditor'
                },
                {
                    caption: 'Динамическое свойство',
                    name: 'dynamicString',
                    isEditable: true,
                    editorTemplateName: 'Controls/propertyGrid:StringEditor'
                }
            ],
            keyProperty: 'name'
        });
    }

    protected _beginAdd(): void {
        (new Promise((resolve) => {
            const newItem = new Model({
                keyProperty: 'name',
                rawData: {
                    name: 'dynamicString' + (++this._fakeItemId),
                    caption: '',
                    isEditable: true,
                    editorTemplateName: 'Controls/propertyGrid:StringEditor'
                }
            });
            resolve(this._typeDescription.add(newItem));
        })).then((newItem) => {
            this._children.propertyGrid.beginEdit({item: newItem});
        });
    }

    static _styles: string[] = ['Controls-demo/PropertyGridNew/PropertyGrid'];
}
