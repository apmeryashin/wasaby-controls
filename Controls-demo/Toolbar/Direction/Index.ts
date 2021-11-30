import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Toolbar/Direction/Template';
import {Memory, Record} from 'Types/source';
import {data} from '../resources/toolbarItems';

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _buttonsSource: Memory;

    protected _beforeMount(): void {
        this._buttonsSource = new Memory({
            keyProperty: 'id',
            data: data.getItemsWithDirection()
        });
    }

    protected _itemClick(e: Event, item: Record): void {
        if (item.get('isUpdateIcon')) {
            const parentId = item.get('parent');
            const itemsData = data.getItemsWithDirection();
            itemsData.forEach((itemData) => {
                if (itemData.id === parentId) {
                    itemData.icon = item.get('icon');
                }
            });
            this._buttonsSource = new Memory({
                keyProperty: 'id',
                data: itemsData
            });
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
