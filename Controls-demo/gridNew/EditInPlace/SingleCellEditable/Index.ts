import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/SingleCellEditable/SingleCellEditable';
import * as cellTemplate from 'wml!Controls-demo/gridNew/EditInPlace/SingleCellEditable/cellTemplate';
import { IItemAction, TItemActionShowType } from 'Controls/itemActions';
import { IColumnRes } from 'Controls-demo/gridNew/DemoHelpers/DataCatalog';
import { Editing } from 'Controls-demo/gridNew/DemoHelpers/Data/Editing';
import {editing} from 'Controls/list';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _itemActions: IItemAction[];
    private _columns: IColumnRes[];
    private _multiSelectVisibility: 'visible' | 'hidden' | 'onhover' = 'hidden';
    private _selectedKeys = [];
    private _readOnlyColumns = new Set([0, 3]);

    protected _beforeMount(): void {
        this._setViewSource();
        this._setColumns();
        this._setItemActions();
    }

    private _setViewSource(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Editing.getEditingData()
        });
    }

    private _setColumns(): void {
        this._columns = Editing.getEditingColumns().map((column, index) => {
            const isReadOnly = this._readOnlyColumns.has(index);
            const result = {
                ...column,
                editable: !isReadOnly,
                template: undefined
            };

            if (!isReadOnly) {
                result.template = cellTemplate;
            }

            return result;
        });
    }

    private _setItemActions(): void {
        this._itemActions = [{
            id: 1,
            icon: 'icon-Erase icon-error',
            title: 'delete',
            showType: TItemActionShowType.TOOLBAR
        }];
    }

    _onBeforeBeginEdit(options, item, isAdd, columnIndex) {
        if (this._readOnlyColumns.has(columnIndex)){
            return editing.CANCEL;
        }
    }

    _toggleMultiSelectVisibility(e, visibility): void {
        this._multiSelectVisibility = visibility;
    }

    _toggleEditableColumn(e, index): void {
        if (this._readOnlyColumns.has(index)) {
            this._readOnlyColumns.delete(index);
        } else {
            this._readOnlyColumns.add(index);
        }
        this._setColumns();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
