import {TemplateFunction} from 'UI/Base';
import {CollectionItem} from 'Controls/display';
import {IImageDisplayContainerOptions, ImageDisplayContainer} from 'Controls/listTemplates';
import ListController from 'Controls/_newBrowser/TemplateControllers/List';
import TileController from 'Controls/_newBrowser/TemplateControllers/Tile';

import * as Template from 'wml!Controls/_newBrowser/ImageDisplay/ImageDisplayContainer';

interface IBrowserImageDisplayContainerOptions extends IImageDisplayContainerOptions {
    tileItemTemplate: TemplateFunction;
    listCfg: ListController;
    tileCfg: TileController;
}

export default class BrowserImageDisplayContainer extends ImageDisplayContainer {
    protected _template: TemplateFunction = Template;
    protected _tileItemTemplate: TemplateFunction;

    protected _beforeMount(options?: IBrowserImageDisplayContainerOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._itemTemplate = options.itemTemplate;
        this._tileItemTemplate = options.tileItemTemplate;
    }

    protected _getListImageViewMode(item: CollectionItem): string {
        const imageViewMode = this._options.listCfg.imageViewMode;
        return this._hasItemWithImage ? imageViewMode : 'none';
    }

    protected _getListImagePosition(item: CollectionItem): string {
        const imagePosition = this._viewConfiguration.getListCfg().imagePosition;
        return this._hasItemWithImage ? imagePosition : 'none';
    }

    protected _getTileImageViewMode(item: CollectionItem): string {
        const imageViewMode = this._viewConfiguration.getTileCfg().getImageViewMode(item);
        return this._hasItemWithImage ? imageViewMode : 'none';
    }

    protected _getTileImagePosition(item: CollectionItem): string {
        const imagePosition = this._viewConfiguration.getTileCfg().imagePosition;
        return this._hasItemWithImage ? imagePosition : 'none';
    }
}
