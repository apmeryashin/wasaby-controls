import {TemplateFunction} from 'UI/Base';
import {object} from 'Types/util';
import {isEqual} from 'Types/object';

import {TColumns} from 'Controls/grid';
import {
    IImageDisplayContainerOptions as IBaseImageDisplayContainerOptions,
    ImageDisplayContainer as BaseImageDisplayContainer
} from 'Controls/listTemplates';

import TableController from 'Controls/_newBrowser/TemplateControllers/Table';

import * as Template from 'wml!Controls/_newBrowser/ImageDisplay/Container';

interface IImageDisplayContainerOptions extends IBaseImageDisplayContainerOptions {
    columns?: TColumns;
}

/**
 * Класс расширяет Controls/listTemplates:ImageDisplayContainer, добавляя возможность управлять контейнером под изображение
 * в браузере с переключением режима отображения (список/плитка/таблица).
 * Настройки для каждого варианта отображения берутся из опции listConfiguration, переданной в Controls/newBrowser:View
 */
export default class Container extends BaseImageDisplayContainer {
    protected _template: TemplateFunction = Template;
    protected _columns: TColumns;

    protected _beforeMount(options?: IImageDisplayContainerOptions,
                           contexts?: object,
                           receivedState?: void): Promise<void> | void {
        this._columns = options.columns;
    }

    protected _beforeUpdate(options?: IImageDisplayContainerOptions, contexts?: object): void {
        if (!isEqual(options.columns, this._options.columns)) {
            this._columns = this._getPatchedColumns(options.columns);
        }
    }

    private _getPatchedColumns(columns: TColumns): TColumns {
        let newColumns = columns;
        if (columns) {
            newColumns = object.clonePlain(columns);
            newColumns.forEach((column) => {
                const templateOptions: {
                    imageViewMode?: string,
                    hasItemWithImage?: boolean,
                    tableCfg?: TableController } = column.templateOptions || {};
                const imageViewMode = templateOptions.imageViewMode || templateOptions.tableCfg?.imageViewMode;
                templateOptions.hasItemWithImage = this._hasItemWithImage;
                templateOptions.imageViewMode = this._hasItemWithImage ? imageViewMode : null;
                column.templateOptions = templateOptions;
            });
        }
        return newColumns;
    }
}
