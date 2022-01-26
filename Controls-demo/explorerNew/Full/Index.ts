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
        data: Gadgets.getData()
    });

    protected _searchValue: string = '';

    protected _viewMode: TExplorerViewMode = 'table';
    protected _useColumns: boolean = false;

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
     * Если {@link _viewColumnsCount} > 1, то будет отрендерено представление Controls.columns:View
     */
    protected _onViewModeChange(event: SyntheticEvent, newViewMode: string): void {
        this._viewMode = newViewMode as TExplorerViewMode;

        if (this._viewMode === 'list') {
            this._useColumns = this._viewColumnsCount > 1;
        }
    }
    //endregion
}
