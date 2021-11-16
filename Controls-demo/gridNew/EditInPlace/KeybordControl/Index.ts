import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/KeybordControl/KeybordControl';
import * as EditingCellTmpl from 'wml!Controls-demo/gridNew/EditInPlace/KeybordControl/EditingCellTemplate';
import {IColumnRes} from 'Controls-demo/gridNew/DemoHelpers/DataCatalog';
import {Editing} from 'Controls-demo/gridNew/DemoHelpers/Data/Editing';
import {Memory} from 'Types/source';

/**
 * Демо пример для автотестирования аспекта управления управлением редактированием по месту в таблицах с клавиатуры.
 *
 * @remark [НЕ ДЛЯ WI]
 * @private
 */
export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _columns: IColumnRes[] = Editing.getEditingColumns().map((c) => ({...c, template: EditingCellTmpl}));

    private _longStart: boolean = false;
    private _longEnd: boolean = false;

    private _multiSelectVisibility: 'visible' | 'hidden' | 'onhover' = 'hidden';
    private _selectedKeys = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Editing.getEditingData()
        });
    }

    private _beforeBeginEdit(): Promise<void> | void {
        if (this._longStart) {
            return new Promise((resolve) => {
                // tslint:disable-next-line:no-magic-numbers
                setTimeout(() => { resolve(); }, 1000);
            });
        }
    }

    private _beforeEndEdit(): Promise<void> | void {
        if (this._longEnd) {
            return new Promise((resolve) => {
                // tslint:disable-next-line:no-magic-numbers
                setTimeout(() => { resolve(); }, 1000);
            });
        }
    }

    _toggleMultiSelectVisibility(e, visibility): void {
        this._multiSelectVisibility = visibility;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
