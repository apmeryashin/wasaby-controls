import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/KeybordControl/KeybordControl';
import * as EditingCellTmpl from 'wml!Controls-demo/gridNew/EditInPlace/KeybordControl/EditingCellTemplate';
import {IColumnRes} from 'Controls-demo/gridNew/DemoHelpers/DataCatalog';
import {Editing} from 'Controls-demo/gridNew/DemoHelpers/Data/Editing';
import {Memory} from 'Types/source';
import {editing} from 'Controls/list';

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

    private _isCellEditingMode: boolean = false;
    private _editingConfig;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Editing.getEditingData()
        });
        this._editingConfig = {editOnClick: true};
        this._setEditingMode('row');
    }

    private _beforeBeginEdit(e, options, isAdd, columnIndex): Promise<void | editing> {
        return (!this._longStart ? Promise.resolve() : new Promise((resolve) => {
            // tslint:disable-next-line:no-magic-numbers
            setTimeout(resolve, 1000);
        })).then(() => {
            if (this._isCellEditingMode && (columnIndex === 0 || columnIndex === 3)) {
                return editing.CANCEL;
            }
        });
    }

    private _beforeEndEdit(): Promise<void> | void {
        return !this._longEnd ? Promise.resolve() : new Promise((resolve) => {
            // tslint:disable-next-line:no-magic-numbers
            setTimeout(resolve, 1000);
        });
    }

    _toggleMultiSelectVisibility(e, visibility): void {
        this._multiSelectVisibility = visibility;
    }

    _isCellEditingModeChanged(e, val): void {
        this._isCellEditingMode = val;
        this._setEditingMode(this._isCellEditingMode ? 'cell' : 'row');
    }

    _setEditingMode(mode: 'row' | 'cell'): void {
        this._editingConfig = {
            ...this._editingConfig,
            mode
        };
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
