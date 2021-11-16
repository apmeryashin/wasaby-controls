import {default as BaseController, ITemplateControllerOptions} from './Base';
import {ITableConfig} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {TreeItem} from 'Controls/display';

export default class TableController extends BaseController<ITableConfig, TreeItem> {
    constructor(options: ITemplateControllerOptions) {
        super(options);
    }

    protected _getViewModeConfig(): ITableConfig {
        return this._$listConfiguration.table;
    }

    get nodeImageViewMode(): string {
        return this.imageViewMode;
    }

    get imageViewMode(): string {
        return this._viewModeConfig.leaf.imageViewMode;
    }
}
