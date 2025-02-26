import {Control, TemplateFunction} from 'UI/Base';
import PrepareDataUtil from './PrepareDataUtil';
import {EventUtils} from 'UI/Events';
import template = require('wml!Controls/_breadcrumbs/Path/Path');
import {IBreadCrumbsOptions} from './interface/IBreadCrumbs';
import {loadFontWidthConstants, getFontWidth} from 'Controls/Utils/getFontWidth';
import {dataConversion} from './resources/dataConversion';
import {Record} from 'Types/entity';
import 'css!Controls/breadcrumbs';

interface IReceivedState {
    items: Record[];
}
/**
 * Контрол "Хлебные крошки".
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/navigation/bread-crumbs/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_breadcrumbs.less переменные тем оформления}
 * @class Controls/_breadcrumbs/Path
 * @extends UI/Base:Control
 * @mixes Controls/breadcrumbs:IBreadCrumbs
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/breadCrumbs_new/ClickHandler/Index
 * @see Controls/_breadcrumbs/HeadingPath
 */

/*
 * Breadcrumbs.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FBreadCrumbs%2FScenarios">Demo</a>.
 *
 * @class Controls/_breadcrumbs/Path
 * @extends UI/Base:Control
 * @mixes Controls/breadcrumbs:IBreadCrumbs
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @private
 * @author Красильников А.С.
 * @demo Controls-demo/breadCrumbs_new/ClickHandler/Index
 */

class BreadCrumbs extends Control<IBreadCrumbsOptions, IReceivedState> {
    protected _template: TemplateFunction = template;
    protected _visibleItems: any[] =  [];
    protected _notifyHandler: Function = EventUtils.tmplNotify;
    protected _width: number = 0;
    protected _dotsWidth: number = 0;
    protected calculateBreadcrumbsUtil: object;
    protected _arrowWidth: number;
    protected _paddingRight: number;
    protected _items: Record[];

    protected _beforeMount(
        options?: IBreadCrumbsOptions,
        contexts?: object,
        receivedState?: IReceivedState
    ): Promise<IReceivedState> | void {
        this._items = dataConversion(options.items, this._moduleName);
        const hasItems: boolean = this._items && this._items.length > 0;
        if (!options.containerWidth) {
            if (hasItems) {
                this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(this._items);
            }
        } else {
            /*
             * Утилиту PrepareDataUtil для основных преобразований крошек грузим всегда.
             * Утилиту для расчета ширины только тогда, когда нам передают containerWidth
             */
            const arrPromise = [import('Controls/_breadcrumbs/Utils')];
            if (!receivedState) {
                arrPromise.push(loadFontWidthConstants());
            }
            return Promise.all(arrPromise).then((res) => {
                this.calculateBreadcrumbsUtil = res[0].default;
                this._arrowWidth = res[0].ARROW_WIDTH;
                this._paddingRight = res[0].PADDING_RIGHT;
                if (receivedState) {
                    this._dotsWidth = this._getDotsWidth(options.fontSize);
                    this._prepareData(options, options.containerWidth);
                } else {
                    const getTextWidth = res[1];
                    this._dotsWidth = this._getDotsWidth(options.fontSize, getTextWidth);
                    this._prepareData(options, options.containerWidth, getTextWidth);
                    return {
                        items: this._items
                    };
                }
            });
        }
    }

    protected _beforeUpdate(newOptions: IBreadCrumbsOptions): void {
        const isItemsChanged = newOptions.items && newOptions.items !== this._options.items;
        const isContainerWidthChanged = newOptions.containerWidth !== this._options.containerWidth;
        const isFontSizeChanged = newOptions.fontSize !== this._options.fontSize;
        if (isItemsChanged) {
            this._items = dataConversion(newOptions.items, this._moduleName);
        }
        if (isContainerWidthChanged) {
            this._width = newOptions.containerWidth;
        }
        if (isFontSizeChanged) {
            this._dotsWidth = this._getDotsWidth(newOptions.fontSize);
        }
        const isDataChange = isItemsChanged || isContainerWidthChanged || isFontSizeChanged;
        if (isDataChange && newOptions.items) {
            if (this._width) {
                this._calculateBreadCrumbsToDraw(this._items, newOptions);
            } else {
                this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(this._items);
            }
        }
    }
    private _getDotsWidth(fontSize: string, getTextWidth: Function = this._getTextWidth): number {
        const dotsWidth = getTextWidth('...', fontSize) + this._paddingRight;
        return this._arrowWidth + dotsWidth;
    }

    private _prepareData(options: IBreadCrumbsOptions,
                         width: number,
                         getTextWidth: Function = this._getTextWidth): void {
        if (this._items && this._items.length > 0) {
            this._width = width;
            this._calculateBreadCrumbsToDraw(this._items, options, getTextWidth);
        }
    }

    private _getTextWidth(text: string, size: string  = 'xs'): number {
        return getFontWidth(text, size);
    }

    private _calculateBreadCrumbsToDraw(items: Record[],
                                        options: IBreadCrumbsOptions,
                                        getTextWidth: Function = this._getTextWidth): void {
        if (items?.length) {
            this._visibleItems = this.calculateBreadcrumbsUtil.calculateItemsWithDots(
                items, options, 0, this._width, this._dotsWidth, getTextWidth
            );
            this._visibleItems[0].hasArrow = false;
        } else {
            this._visibleItems = [];
        }
    }

    private _itemClickHandler(e, item): void {
        e.stopPropagation();
        this._notify('itemClick', [item]);
        if (this._options.breadCrumbsItemClickCallback) {
            this._options.breadCrumbsItemClickCallback(e, item);
        }
    }
    static getDefaultOptions(): IBreadCrumbsOptions {
        return {
            displayProperty: 'title',
            fontSize: 'xs'
        };
    }
}

Object.defineProperty(BreadCrumbs, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return BreadCrumbs.getDefaultOptions();
   }
});

/**
 * @name Controls/_breadcrumbs/Path#fontSize
 * @cfg
 * @demo Controls-demo/breadCrumbs_new/FontSize/Index
 */
export default BreadCrumbs;
