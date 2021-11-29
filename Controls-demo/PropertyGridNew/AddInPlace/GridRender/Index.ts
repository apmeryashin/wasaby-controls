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

    protected _beforeMount(): void {
        this._editingObject = new Model<IPropertyGridItem>({
            rawData: {
                dynamicString: 'http://mysite.com'
            }
        });
        this._typeDescription = new RecordSet<IPropertyGridItem>({
            rawData: [
                {
                    caption: 'URL',
                    name: 'dynamicString',
                    isDynamic: true
                }
            ],
            keyProperty: 'name'
        });
        this._itemActions = [
            {
                id: 1,
                icon: 'icon-Erase',
                iconStyle: 'danger',
                showType: TItemActionShowType.MENU,
                title: 'Удалить',
                handler: (item: Model) => {
                    const key = item.getKey();
                    this._typeDescription.remove(this._typeDescription.getRecordById(key));
                }
            }
        ];
    }

    protected _beginAdd(): void {
        this._children.propertyGrid.beginAdd();
    }

    protected _beginAddTemplated(): void {
        this._children.propertyGrid.beginAdd({
            item: new Model({
                keyProperty: 'key',
                rawData: {key: ++this._fakeItemId, title: 'Новая запись...'}
            })
        });
    }

    static _styles: string[] = ['Controls-demo/PropertyGridNew/PropertyGrid'];
}
