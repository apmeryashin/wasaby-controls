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
        const id = item.getId();
        if (id === '9') {
            const itemsData = [
                {icon: 'icon-Burger', title: 'Список'},
                {icon: 'icon-ArrangePreview', title: 'Плитка'}
            ];
            const data = item.get('icon') === itemsData[0].icon ? itemsData[1] : itemsData[0];
            item.set('icon', data.icon);
            item.set('title', data.title);
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
