import {IColumn} from 'Controls/grid';
import {TKey} from 'Controls/interface';
import {Control, TemplateFunction} from 'UI/Base';
import {TExplorerViewMode} from 'Controls/explorer';
import {HierarchicalMemory, Memory} from 'Types/source';
import * as template from 'wml!Controls-demo/explorerNew/Full/Index';
import {Gadgets} from 'Controls-demo/explorerNew/DataHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/explorerNew/Full/Index';

/**
 * Большая демка для тестирования сложных сценариев использования explorer,
 * когда в несколько шагов меняются несколько опций
 */
export default class Index extends Control {
    protected _template: TemplateFunction = template;

    //region template props
    protected _root: TKey = null;
    protected _columns: IColumn[] = Gadgets.getColumns();
    protected _viewSource: HierarchicalMemory = new HierarchicalMemory({
        keyProperty: 'id',
        parentProperty: 'parent',
        data: Gadgets.getData(),
        filter: (item, query: {searchStr: string}) => {
            if (query.searchStr) {
                return item.get('title').toLowerCase().includes(query.searchStr.toLowerCase());
            }

            return true;
        }
    });

    protected _searchStr: string = '';
    protected get _searchValue(): string {
        return this._searchStr;
    }
    protected set _searchValue(value: string) {
        this._searchStr = value;

        if (this._onClearSearchHandlers.length) {
            this._onClearSearchHandlers.forEach((callback) => callback());
            this._onClearSearchHandlers = [];
        }
    }
    private _onClearSearchHandlers: Function[] = [];

    protected _useColumns: boolean = false;
    protected _viewModeChangeStatus: string = '';
    protected _viewMode: TExplorerViewMode = 'table';

    // Источник данные для выбора режима отображения списка
    protected _viewModeSource: Memory = new Memory({
        keyProperty: 'id',
        data: [
            {id: 'table'},
            {id: 'tile'},
            {id: 'list'},
            {id: 'search'}
        ]
    });

    // Кол-во колонок, отображаемых в представлении с viewMode === 'list'
    // если задано больше одной, то будет отрендерено представление Controls.columns:View
    protected _viewColumnsCount: number = 1;
    //endregion

    //region toolbar handlers
    /**
     * Обработчик пользовательской смены viewMode.
     * Если задана строка поиска, то viewMode будет применен после её очистки.
     * Если {@link _viewColumnsCount} > 1, то будет отрендерено представление Controls.columns:View.
     */
    protected _onViewModeChange(event: SyntheticEvent, newViewMode: TExplorerViewMode): void {
        if (this._searchValue) {
            this._viewModeChangeStatus = `the view mode will be changed to ${newViewMode} after resetting the search string`;
            this._onClearSearchHandlers.push(() => {
                this._viewModeChangeStatus = '';
                this._changeViewMode(newViewMode);
            });
            return;
        }

        this._changeViewMode(newViewMode);
    }
    //endregion

    private _changeViewMode(newViewMode: TExplorerViewMode): void {
        this._viewMode = newViewMode;

        if (this._viewMode === 'list') {
            this._useColumns = this._viewColumnsCount > 1;
        }
    }
}
