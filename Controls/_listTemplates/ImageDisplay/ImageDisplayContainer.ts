import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {IObservable, RecordSet} from 'Types/collection';
import {isEqual} from 'Types/object';

import {TColumns} from 'Controls/grid';
import {NewSourceController as SourceController} from 'Controls/dataSource';

import * as Template from 'wml!Controls/_listTemplates/ImageDisplay/ImageDisplayContainer';
import {object} from 'Types/util';
import {Object as EventObject} from 'Env/Event';
import {Model} from 'Types/entity';
import {TreeItem} from 'Controls/display';

export interface IImageDisplayContainerOptions extends IControlOptions {
    imageProperty: string;
    imagePosition: string;
    imageViewMode: string;
    nodeImageViewMode: string;
    itemTemplate: TemplateFunction;
    tileItemTemplate: TemplateFunction;
    sourceController: SourceController;
}

/**
 * Класс используется для управления в списочных шаблонах выводом контейнера, предназначенного под изображение и
 * позволяет в случае отсутствия изображений среди загруженных записей - при выводе шаблона скрывать данный контейнер.
 * @remark
 * При использовании ImageDisplayContainer необходимо оборачивать в Controls.list:DataContainer.
 * Опции {@link Controls/tile:RichTemplate#imageViewMode imageViewMode}, {@link Controls/tile:RichTemplate#imagePosition imagePosition} и {@link Controls/tile:ITile#imageProperty imageProperty} необходимо задавать непосредственно на ImageDisplayContainer.
 * @example
 * <pre class="brush:html">
 *    <Controls.list:DataContainer
 *            displayProperty="title"
 *            navigation="{{_navigation}}"
 *            source="{{_viewSource}}">
 *        <Controls.listTemplates:ImageDisplayContainer
 *                imageProperty="image"
 *                imageViewMode="rectangle"
 *                imagePosition="left">
 *            <ws:content>
 *                <Controls.tile:View
 *                        tileMode="static"
 *                        tileWidth="350"
 *                        keyProperty="key"/>
 *            </ws:content>
 *        </Controls.listTemplates:ImageDisplayContainer>
 *    </Controls.list:DataContainer>
 * </pre>
 * @class Controls/_listTemplates/ImageDisplayContainer/ImageDisplayContainer
 * @extends UI/Base:Control
 *
 * @author Авраменко А.С.
 * @public
 * @demo Controls-demo/tileNew/DifferentItemTemplates/ToggleImageVisible/ScrollToDown/
 */

export default class ImageDisplayContainer extends Control<IImageDisplayContainerOptions> {
    protected _template: TemplateFunction = Template;

    private _columns: TColumns;
    private _patchedColumns: TColumns;

    /**
     * @name Controls/_listTemplates/ImageDisplayContainer/ImageDisplayContainer#itemTemplate
     * @cfg {UI/Base:TemplateFunction} Шаблон записи, для которого будет рассчитан imageViewMode и imagePosition.
     */
    private _itemTemplate: TemplateFunction;
    private _tileItemTemplate: TemplateFunction;

    /**
     * @name Controls/_listTemplates/ImageDisplayContainer/ImageDisplayContainer#imagePosition
     * @cfg {String} Текущая позиция изображения.
     */
    private _imagePosition: string;

    /**
     * @name Controls/_listTemplates/ImageDisplayContainer/ImageDisplayContainer#imageViewMode
     * @cfg {String} Режим отображения изображения.
     */
    private _imageViewMode: string;

    /**
     * @name Controls/_listTemplates/ImageDisplayContainer/ImageDisplayContainer#nodeImageViewMode
     * @cfg {String} Режим отображения изображения для узла, если контейнер оборачивает дерево.
     */
    private _nodeImageViewMode: string;
    private _imageProperty: string;
    private _hasItemWithImage: boolean = false;
    private _items: RecordSet;

    constructor(options: IImageDisplayContainerOptions, context?: object) {
        super(options, context);
        this._onCollectionChange = this._onCollectionChange.bind(this);
        this._onCollectionItemChange = this._onCollectionItemChange.bind(this);
    }

    protected _beforeMount(options?: IImageDisplayContainerOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        if (!options.sourceController) {
            Logger.error('ImageDisplayContainer should be child of Browser or DataContainer', this);
        }
        this._imagePosition = options.imagePosition;
        this._imageViewMode = options.imageViewMode;
        this._nodeImageViewMode = options.nodeImageViewMode;
        this._itemTemplate = options.itemTemplate;
        this._tileItemTemplate = options.tileItemTemplate;
        this._imageProperty = options.imageProperty;
        this._columns = options.columns;
        this._updateItems(options.sourceController.getItems());
    }

    protected _beforeUpdate(options?: IImageDisplayContainerOptions, contexts?: any): void {
        if (this._options.imagePosition !== options.imagePosition) {
            this._imagePosition = options.imagePosition;
        }
        if (this._options.imageViewMode !== options.imageViewMode) {
            this._imageViewMode = options.imageViewMode;
        }
        if (this._options.nodeImageViewMode !== options.nodeImageViewMode) {
            this._nodeImageViewMode = options.nodeImageViewMode;
        }
        if (this._options.itemTemplate !== options.itemTemplate) {
            this._itemTemplate = options.itemTemplate;
        }
        if (this._options.tileItemTemplate !== options.tileItemTemplate) {
            this._tileItemTemplate = options.tileItemTemplate;
        }

        if (!isEqual(options.columns, this._options.columns)) {
            this._columns = options.columns;
            this._patchedColumns = null;
        }
        this._updateItems(this._options.sourceController.getItems());
        if (options.imageProperty !== this._options.imageProperty) {
            this._imageProperty = options.imageProperty;
            this._resetHasItemWithImage();
            this._updateDisplayImage(this._items, this._imageProperty);
            if (!options.imageProperty) {
                this._unsubscribeToCollectionChange(this._items, this._onCollectionItemChange, this._onCollectionChange);
            }
        }
    }

    protected _beforeUnmount(): void {
        this._unsubscribeToCollectionChange(this._items, this._onCollectionItemChange, this._onCollectionChange);
    }

    /**
     * Обновляем состояние hasItemWithImage.
     * Если текущее значение false, но в новых загруженных элементах вдруг стало true, нужно актуализировать.
     * @param items RecordSet, в котором мы ищем картинку.
     * @param imageProperty Свойство записи, в котором содержится картинка.
     * @private
     */
    private _updateDisplayImage(items: RecordSet, imageProperty: string): void {
        if (imageProperty && !this._hasItemWithImage) {
            const oldHasItemWithImage = this._hasItemWithImage;
            this._hasItemWithImage = ImageDisplayContainer._hasImage(items, imageProperty);
            if (oldHasItemWithImage !== this._hasItemWithImage) {
                this._patchedColumns = null;
            }
        }
    }

    private _updateItems(items) {
        if (this._items !== items) {
            this._items = items;
            this._resetHasItemWithImage();
            if (items) {
                this._subscribeToCollectionChange(this._items, this._onCollectionItemChange, this._onCollectionChange);
                this._updateDisplayImage(this._items, this._imageProperty);
            }
        }
    }

    private _subscribeToCollectionChange(items, onCollectionItemChange, onCollectionChange) {
        items.subscribe('oncollectionitemchange', onCollectionItemChange);
        items.subscribe('oncollectionchange', onCollectionChange);
    }

    private _unsubscribeToCollectionChange(items, onCollectionItemChange, onCollectionChange) {
        items.unsubscribe('oncollectionitemchange', onCollectionItemChange);
        items.unsubscribe('oncollectionchange', onCollectionChange);
    }

    private _resetHasItemWithImage(): void {
        this._hasItemWithImage = false;
        this._patchedColumns = null;
    }

    private _onCollectionItemChange(event: EventObject,
                                    item: Model,
                                    index: number,
                                    properties?: object): void {
        // Изменение элемента, поменяли _imageProperty в записи в RecordSet.
        if (this._options.imageProperty && typeof properties === 'object' &&
            this._options.imageProperty in properties) {
            this._resetHasItemWithImage();
            this._updateDisplayImage(this._items, this._imageProperty);
        }
    }

    private _onCollectionChange(event: EventObject, action: string): void {
        switch (action) {
            case IObservable.ACTION_RESET:
            case IObservable.ACTION_REMOVE:
                this._resetHasItemWithImage();
                this._updateDisplayImage(this._items, this._imageProperty);
                break;
            case IObservable.ACTION_ADD:
                this._updateDisplayImage(this._items, this._imageProperty);
        }
    }

    /**
     * Возвращает отображение картинки для текущего элемента
     * @param item
     * @private
     */
    protected _getImageViewMode(item: TreeItem): string {
        let imageViewMode;
        imageViewMode = item.isNode && item.isNode() ? this._nodeImageViewMode : this._imageViewMode;
        return this._hasItemWithImage ? imageViewMode : 'none';
    }

    /**
     * Возвращает положение картинки для текущего элемента
     * @param item
     * @private
     */
    protected _getImagePosition(item: TreeItem): string {
        return this._hasItemWithImage ? this._imagePosition : 'none';
    }

    private _getPatchedColumns(): TColumns {
        if (!this._columns) {
            return undefined;
        }
        if (!this._imageProperty) {
            return this._columns;
        }
        if (!this._patchedColumns) {
            this._patchedColumns = object.clonePlain(this._columns);
            this._patchedColumns.forEach((column) => {
                const templateOptions: { imageViewMode?: string } = column.templateOptions || {};
                templateOptions.imageViewMode = this._hasItemWithImage ? templateOptions.imageViewMode : 'none';
                column.templateOptions = templateOptions;
            });
        }
        return this._patchedColumns;
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

/**
 * @name Controls/_listTemplates/ImageDisplayContainer/ImageDisplayContainer#imageProperty
 * @cfg {String} Название поле записи в котором лежит ссылка на картинку.
 */
