import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {RecordSet} from 'Types/collection';
import {isEqual} from 'Types/object';

import {TColumns} from 'Controls/grid';
import {NewSourceController as SourceController} from 'Controls/dataSource';

import * as Template from 'wml!Controls/_listTemplates/ImageDisplay/ImageDisplayContainer';
import {object} from 'Types/util';
import {Object as EventObject} from 'Env/Event';
import {Model} from 'Types/entity';

interface IImageDisplayContainerOptions extends IControlOptions {
    itemsReadyCallback: (items: RecordSet) => void;
    imageProperty: string;
    imagePosition: string;
    imageViewMode: string;
    itemTemplate: TemplateFunction;
    tileItemTemplate: TemplateFunction;
    columns?: TColumns;
    sourceController: SourceController;
}

export default class ImageDisplayContainer extends Control<IImageDisplayContainerOptions> {
    protected _template: TemplateFunction = Template;

    private _columns: TColumns;
    private _itemTemplate: TemplateFunction;
    private _tileItemTemplate: TemplateFunction;
    private _imagePosition: string;
    private _imageViewMode: string;
    private _hasItemWithImage: boolean = false;
    private _items: RecordSet;

    constructor(options: IImageDisplayContainerOptions, context?: object) {
        super(options, context);
        this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._onCollectionItemChange = this._onCollectionItemChange.bind(this);
    }

    protected _beforeMount(options?: IImageDisplayContainerOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._imagePosition = options.imagePosition;
        this._imageViewMode = options.imageViewMode;
        this._columns = options.columns;
        this._itemTemplate = options.itemTemplate;
        this._tileItemTemplate = options.tileItemTemplate;
        if (!options.sourceController) {
            Logger.error('ImageDisplayContainer should be child of Browser or DataContainer', this);
        }
    }

    private _updateDisplayImage(items, imageProperty) {
        if (imageProperty) {
            const newDisplayImage = ImageDisplayContainer._hasImage(items, imageProperty);
            if (this._hasItemWithImage !== newDisplayImage) {
                this._hasItemWithImage = newDisplayImage;
            }
        }
    }

    private _subscribeToCollectionChange(items, onCollectionItemChange) {
        items.subscribe('oncollectionitemchange', onCollectionItemChange);
    }

    private _unsubscribeToCollectionChange(items, onCollectionItemChange) {
        items.unsubscribe('oncollectionitemchange', onCollectionItemChange);
    }

    protected _beforeUpdate(options?: IImageDisplayContainerOptions, contexts?: any): void {
        if (!isEqual(options.columns, this._columns)) {
            this._columns = this._getPatchedColumns(options.columns);
        }
        if (options.imageProperty !== this._options.imageProperty) {
            this._updateDisplayImage(this._items, options.imageProperty);
            if (!options.imageProperty) {
                this._unsubscribeToCollectionChange(this._items, this._onCollectionItemChange);
            }
        }
    }

    destroy(): void {
        this._unsubscribeToCollectionChange(this._items, this._onCollectionItemChange);
    }

    private _itemsReadyCallback(items: RecordSet): void {
        this._items = items;
        this._subscribeToCollectionChange(this._items, this._onCollectionItemChange);
        this._updateDisplayImage(this._items, this._options.imageProperty);

        if (this._options.itemsReadyCallback) {
            this._options.itemsReadyCallback(items);
        }
    }

    private _dataLoadCallback(items: RecordSet, direction): void {
        this._updateDisplayImage(this._items, this._options.imageProperty);
        if (this._options.dataLoadCallback) {
            this._options.dataLoadCallback(items, direction);
        }
    }

    private _onCollectionItemChange(event: EventObject,
                            item: Model,
                            index: number,
                            properties?: object): void {
        // Изменение элемента, поменяли _imageProperty в записи в RecordSet
        if (this._options.imageProperty && this._options.imageProperty in properties) {
            this._updateDisplayImage(this._items, this._options.imageProperty);
        }
    }

    private _getImageViewMode(imageViewMode?: string): string {
        return this._hasItemWithImage ? imageViewMode || this._imageViewMode : 'none';
    }

    private _getImagePosition(imagePosition?: string): string {
        return this._hasItemWithImage ? imagePosition || this._imagePosition : 'none';
    }

    private _getPatchedColumns(columns: TColumns): TColumns {
        let newColumns = columns;
        if (columns) {
            newColumns = object.clone(columns);
            newColumns.forEach((column) => {
                const templateOptions: {imageViewMode?: string} = column.templateOptions || {};
                templateOptions.imageViewMode = this._getImageViewMode(templateOptions.imageViewMode);
                column.templateOptions = templateOptions;
            });
        }
        return newColumns;
    }

    private static _hasImage(items: RecordSet, imageProperty: string): boolean {
        let has = false;
        if (imageProperty) {
            const length = items.getCount();
            for (let i = 0; i < length; i++) {
                if (items.at(i).get(imageProperty)) {
                    has = true;
                    break;
                }
            }
        }
        return has;
    }
}
