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
import {TreeItem} from 'Controls/display';
import {Direction} from 'Controls/interface';

export interface IImageDisplayContainerOptions extends IControlOptions {
    itemsReadyCallback: (items: RecordSet) => void;
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
        this._nodeImageViewMode = options.nodeImageViewMode;
        this._columns = options.columns;
        this._itemTemplate = options.itemTemplate;
        this._tileItemTemplate = options.tileItemTemplate;
        if (!options.sourceController) {
            Logger.error('ImageDisplayContainer should be child of Browser or DataContainer', this);
        }
    }

    private _updateDisplayImage(items: RecordSet, imageProperty: string, isResetState: boolean): void {
        if (imageProperty && (isResetState || !this._hasItemWithImage)) {
            this._hasItemWithImage = ImageDisplayContainer._hasImage(items, imageProperty);
        }
    }

    private _subscribeToCollectionChange(items, onCollectionItemChange) {
        items.subscribe('oncollectionitemchange', onCollectionItemChange);
    }

    private _unsubscribeToCollectionChange(items, onCollectionItemChange) {
        items.unsubscribe('oncollectionitemchange', onCollectionItemChange);
    }

    protected _beforeUpdate(options?: IImageDisplayContainerOptions, contexts?: any): void {
        if (!isEqual(options.columns, this._options.columns)) {
            this._columns = this._getPatchedColumns(options.columns);
        }
        if (options.imageProperty !== this._options.imageProperty) {
            this._updateDisplayImage(this._items, options.imageProperty, true);
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
        this._updateDisplayImage(this._items, this._options.imageProperty, true);

        if (this._options.itemsReadyCallback) {
            this._options.itemsReadyCallback(items);
        }
    }

    private _dataLoadCallback(items: RecordSet, direction: Direction): void {
        if (!this._items) {
            this._items = items;
        }

        if (direction) {
            this._updateDisplayImage(items, this._options.imageProperty, false);
        }

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
            this._updateDisplayImage(this._items, this._options.imageProperty, false);
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

    private _getPatchedColumns(columns: TColumns): TColumns {
        let newColumns = columns;
        if (columns) {
            newColumns = object.clonePlain(columns);
            newColumns.forEach((column) => {
                const templateOptions: { imageViewMode?: string } = column.templateOptions || {};
                templateOptions.imageViewMode = this._hasItemWithImage ? templateOptions.imageViewMode : 'none';
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

/**
 * @name Controls/_listTemplates/ImageDisplayContainer/ImageDisplayContainer#imageProperty
 * @cfg {String} Название поле записи в котором лежит ссылка на картинку.
 */
