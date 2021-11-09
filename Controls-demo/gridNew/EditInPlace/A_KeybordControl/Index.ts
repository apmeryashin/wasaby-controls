import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/A_KeybordControl/KeybordControl';
import * as EditingCellTmpl from 'wml!Controls-demo/gridNew/EditInPlace/A_KeybordControl/EditingCellTemplate';
import {IColumnRes} from 'Controls-demo/gridNew/DemoHelpers/DataCatalog';
import {Editing} from 'Controls-demo/gridNew/DemoHelpers/Data/Editing';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _columns: IColumnRes[] = Editing.getEditingColumns().map((c) => ({...c, template: EditingCellTmpl}));

    private _longStart: boolean = false;
    private _longEnd: boolean = false;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Editing.getEditingData()
        });
    }

    private _beforeBeginEdit() {
        if (this._longStart) {
            return new Promise((resolve) => {
                // tslint:disable-next-line:no-magic-numbers
                setTimeout(() => { resolve(); }, 1000);
            });
        }
    }

    private _beforeEndEdit() {
        if (this._longEnd) {
            return new Promise((resolve) => {
                // tslint:disable-next-line:no-magic-numbers
                setTimeout(() => { resolve(); }, 1000);
            });
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
