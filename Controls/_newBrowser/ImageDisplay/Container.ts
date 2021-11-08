import {TemplateFunction} from 'UI/Base';
import {object} from 'Types/util';
import {isEqual} from 'Types/object';
import {CollectionItem} from 'Controls/display';
import {
    IImageDisplayContainerOptions as IBaseImageDisplayContainerOptions,
    ImageDisplayContainer as BaseImageDisplayContainer
} from 'Controls/listTemplates';
import {TColumns} from 'Controls/grid';

import ListController from 'Controls/_newBrowser/TemplateControllers/List';
import TileController from 'Controls/_newBrowser/TemplateControllers/Tile';
import TableController from 'Controls/_newBrowser/TemplateControllers/Table';

import * as Template from 'wml!Controls/_newBrowser/ImageDisplay/Container';

interface IImageDisplayContainerOptions extends IBaseImageDisplayContainerOptions {
    tileItemTemplate: TemplateFunction;
    listCfg: ListController;
    tileCfg: TileController;
    tableCfg: TableController;
    columns?: TColumns;
}

/**
 * Класс расширяет Controls/listTemplates:ImageDisplayContainer, добавляя возможность управлять контейнером под изображение
 * в браузере с переключением режима отображения (список/плитка/таблица).
 * Настройки для каждого варианта отображения берутся из опции listConfiguration, переданной в Controls/newBrowser:View
 */
export default class Container extends BaseImageDisplayContainer {
    protected _template: TemplateFunction = Template;
    protected _tileItemTemplate: TemplateFunction;
    protected _columns: TColumns;

    protected _beforeMount(options?: IImageDisplayContainerOptions,
                           contexts?: object,
                           receivedState?: void): Promise<void> | void {
        this._itemTemplate = options.itemTemplate;
        this._tileItemTemplate = options.tileItemTemplate;
        this._columns = options.columns;
    }

    protected _beforeUpdate(options?: IImageDisplayContainerOptions, contexts?: object): void {
        if (!isEqual(options.columns, this._options.columns)) {
            this._columns = this._getPatchedColumns(options.columns);
        }
    }

    protected _getListImageViewMode(item: CollectionItem): string {
        const imageViewMode = this._options.listCfg?.imageViewMode;
        return this._hasItemWithImage ? imageViewMode : 'none';
    }

    protected _getListImagePosition(item: CollectionItem): string {
        const imagePosition = this._options.listCfg?.imagePosition;
        return this._hasItemWithImage ? imagePosition : 'none';
    }

    protected _getTileImageViewMode(item: CollectionItem): string {
        const imageViewMode = this._options.tileCfg && this._options.tileCfg.getImageViewMode(item);
        return this._hasItemWithImage ? imageViewMode : 'none';
    }

    protected _getTileImagePosition(item: CollectionItem): string {
        const imagePosition = this._options.tileCfg?.imagePosition;
        return this._hasItemWithImage ? imagePosition : 'none';
    }

    private _getPatchedColumns(columns: TColumns): TColumns {
        let newColumns = columns;
        if (columns) {
            newColumns = object.clonePlain(columns);
            newColumns.forEach((column) => {
                const templateOptions: {imageViewMode?: string} = column.templateOptions || {};
                const imageViewMode = templateOptions.imageViewMode || this._options.tableCfg?.imageViewMode;
                templateOptions.imageViewMode = this._hasItemWithImage ? imageViewMode : null;
                column.templateOptions = templateOptions;
            });
        }
        return newColumns;
    }
}
