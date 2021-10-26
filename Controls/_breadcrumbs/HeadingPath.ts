import {Control, TemplateFunction} from 'UI/Base';
import PrepareDataUtil from './PrepareDataUtil';
import {EventUtils} from 'UI/Events';
import {applyHighlighter} from 'Controls/_breadcrumbs/resources/applyHighlighter';
import template = require('wml!Controls/_breadcrumbs/HeadingPath/HeadingPath');
import Common from './HeadingPath/Common';
import 'Controls/heading';
import 'css!Controls/heading';
import 'css!Controls/breadcrumbs';
import 'wml!Controls/_breadcrumbs/HeadingPath/Back';
import {loadFontWidthConstants, getFontWidth} from 'Controls/Utils/getFontWidth';
import {dataConversion} from './resources/dataConversion';
import {Model, Record} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Path} from 'Controls/dataSource';
import {IHeadingPath} from './interface/IHeadingPath';
import calculateBreadcrumbsUtil, {ARROW_WIDTH, PADDING_RIGHT} from 'Controls/_breadcrumbs/Utils';

interface IReceivedState {
    items?: Record[];
    breadCrumbsWidth?: number;
    backButtonWidth?: number;
}

const SIZES = {
    ARROW_WIDTH: 12,
    HOME_BUTTON_WIDTH: 24
};

/**
 * Хлебные крошки с кнопкой "Назад".
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/navigation/bread-crumbs/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_breadcrumbs.less переменные тем оформления}
 *
 * @class Controls/_breadcrumbs/HeadingPath
 * @extends UI/Base:Control
 * @mixes Controls/breadcrumbs:IBreadCrumbs
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/BreadCrumbs/ScenarioFirst/Index
 * @see Controls/_breadcrumbs/Path
 */

/*
 * Breadcrumbs with back button.
 *
 * @class Controls/_breadcrumbs/HeadingPath
 * @extends UI/Base:Control
 * @mixes Controls/breadcrumbs:IBreadCrumbs
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @public
 * @author Красильников А.С.
 *
 * @demo Controls-demo/BreadCrumbs/ScenarioFirst/Index
 */
class BreadCrumbsPath extends Control<IHeadingPath> {
    protected _template: TemplateFunction = template;
    protected _backButtonCaption: string = '';
    protected _backButtonItem: Record = null;
    protected _visibleItems: Record[] = null;
    protected _breadCrumbsItems: Record[] = null;
    protected _items: Record[] = null;
    protected _backButtonClass: string = '';
    protected _breadCrumbsWrapperClass: string = '';
    protected _breadCrumbsClass: string = '';
    private _crumbsWidth: number;
    private _backButtonWidth: number;
    protected _notifyHandler: Function = EventUtils.tmplNotify;
    protected _applyHighlighter: Function = applyHighlighter;
    protected _getRootModel: Function = Common.getRootModel;
    protected _dotsWidth: number = 0;
    protected _indexEdge: number = 0;
    protected _isHomeVisible: boolean = false;
    private _initializingWidth: number;

    protected _beforeMount(options?: IHeadingPath,
                           contexts?: object,
                           receivedState?: IReceivedState): Promise<IReceivedState> | void {
        if (receivedState) {
            this._initStatesBeforeMount(options, receivedState);
        } else {
            return loadFontWidthConstants().then((getTextWidth: Function) => {
                this._initStatesBeforeMount(options, receivedState, getTextWidth);
                return {
                    items: this._breadCrumbsItems,
                    breadCrumbsWidth: this._crumbsWidth,
                    backButtonWidth: this._backButtonWidth
                };
            });
        }
    }

    protected _initStatesBeforeMount(options?: IHeadingPath,
                                     receivedState?: IReceivedState,
                                     getTextWidth: Function = this._getTextWidth): void {
        this._items = dataConversion(options.items, this._moduleName);
        this._prepareItems(options, receivedState, getTextWidth);

        // Ветка, где построение идет на css
        if (this._breadCrumbsItems && !options.containerWidth) {
            this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(this._breadCrumbsItems);
            return;
        }

        if (options.containerWidth) {
            this._initializingWidth = options.containerWidth;
            this._dotsWidth = this._getDotsWidth(options.fontSize, getTextWidth);
            this._prepareData(options, getTextWidth);
        }
    }

    protected _beforeUpdate(newOptions: IHeadingPath): void {
        const isItemsChanged = newOptions.items !== this._options.items;
        const isContainerWidthChanged = newOptions.containerWidth !== this._options.containerWidth;
        const isFontSizeChanged = newOptions.fontSize !== this._options.fontSize;
        if (isItemsChanged) {
            this._items = dataConversion(newOptions.items, this._moduleName);
        }
        if (isFontSizeChanged) {
            this._dotsWidth = this._getDotsWidth(newOptions.fontSize);
        }
        const isDataChange = isItemsChanged || isContainerWidthChanged || isFontSizeChanged;

        if (!this._initializingWidth && newOptions.containerWidth) {
            const parentModuleName = this._logicParent?._moduleName;
            const text = `Опция containerWidth должна быть установлена сразу, на момент построения контрола.
                          Задание значения в цикле обновления некорректно, контрол может работать неправильно.
                          Контрол, устанавливающий опции: ${parentModuleName}`;
            Logger.error(text, this);
        } else {
            if (isDataChange) {
                this._prepareItems(newOptions);
                if (this._breadCrumbsItems) {
                    if (newOptions.containerWidth) {
                        this._calculateBreadCrumbsToDraw(this._breadCrumbsItems, newOptions);
                    } else {
                        this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(this._breadCrumbsItems);
                    }
                }
            }
        }
    }
    private _getDotsWidth(fontSize: string, getTextWidth: Function = this._getTextWidth): number {
        const dotsWidth = getTextWidth('...', fontSize) + PADDING_RIGHT;
        return ARROW_WIDTH + dotsWidth;
    }
    private _prepareData(options: IHeadingPath, getTextWidth: Function = this._getTextWidth): void {
        if (this._items && this._items.length > 1) {
            this._calculateBreadCrumbsToDraw(this._breadCrumbsItems, options, getTextWidth);
        }
    }
    private _getTextWidth(text: string, size: string  = 'xs'): number {
        return getFontWidth(text, size);
    }
    private _calculateBreadCrumbsToDraw(items: Record[],
                                        options: IHeadingPath,
                                        getTextWidth: Function = this._getTextWidth): void {
        if (items && items.length > 0) {
            const textWidth = getTextWidth(this._backButtonCaption, '3xl');
            const width = options.containerWidth - textWidth - SIZES.ARROW_WIDTH - SIZES.HOME_BUTTON_WIDTH;
            this._visibleItems = calculateBreadcrumbsUtil.calculateItemsWithDots(
                items, options, 0, width, this._dotsWidth, getTextWidth
            );
            this._visibleItems[0].hasArrow = false;
            this._indexEdge = 0;
        }
    }

    protected _onBackButtonClick(e: Event): void {
        Common.onBackButtonClick.call(this, e);
    }

    protected _onHomeClick(): void {
        this._notify('itemClick', [this._buildRootModel()]);
    }

    /**
     * Обработчик изменения пути через компонент Controls._breadcrumbs.PathButton
     */
    protected _onPathChanged(event: SyntheticEvent, path: Path): void {
        const newRoot = path.length ? path[path.length - 1] : this._buildRootModel();
        this._notify('itemClick', [newRoot]);
    }

    protected _getCounterCaption(items: Record[] = []): void {
        if (items === null) {
            items = [];
        }

        const lastItem = items[items.length - 1];
        return lastItem?.get('counterCaption');
    }

    private _getCrumbsWidth(options: IHeadingPath,
                            getTextWidth: Function = this._getTextWidth
    ): {backButtonWidth: number, breadCrumbsWidth: number} {
        const crumbsWidthArr = calculateBreadcrumbsUtil.getItemsWidth(this._breadCrumbsItems, options, getTextWidth);
        return {
            backButtonWidth: this._backButtonCaption &&
                !options.withoutBackButton ? getTextWidth(this._backButtonCaption, '3xl') : 0,
            breadCrumbsWidth: crumbsWidthArr.reduce((accumulator, current) => accumulator + current, 0)
        };
    }

    private _updateBreadCrumbsClasses(options: IHeadingPath,
                                      receivedState?: IReceivedState,
                                      getTextWidth: Function = this._getTextWidth): void {
        if (receivedState) {
            this._crumbsWidth = receivedState.breadCrumbsWidth;
            this._backButtonWidth = receivedState.backButtonWidth;
        } else {
            const crumbsWidthObj = this._getCrumbsWidth(options, getTextWidth);
            this._crumbsWidth = crumbsWidthObj.breadCrumbsWidth;
            this._backButtonWidth = crumbsWidthObj.backButtonWidth;
        }
        if (this._crumbsWidth > this._backButtonWidth) {
            this._breadCrumbsWrapperClass = 'controls-BreadCrumbsPath__unrestrictedWidth';
            this._backButtonClass = 'controls-BreadCrumbsPath__widthRestriction';
        } else {
            this._breadCrumbsWrapperClass = 'controls-BreadCrumbsPath__widthRestriction';
            this._backButtonClass = 'controls-BreadCrumbsPath__unrestrictedWidth';
        }
    }

    /**
     * На основании текущий опций собирает модель корневого каталога
     */
    private _buildRootModel(): Model {
        return this._getRootModel(this._options.items[0].get(this._options.parentProperty), this._options.keyProperty);
    }

    private _prepareItems(options: IHeadingPath,
                          receivedState?: IReceivedState,
                          getTextWidth: Function = this._getTextWidth): void {
        const clearCrumbsView = () => {
            this._visibleItems = null;
            this._breadCrumbsItems = null;
            this._backButtonClass = '';
            this._breadCrumbsClass = '';
            this._breadCrumbsWrapperClass = '';
            this._isHomeVisible = false;
        };

        if (this._items?.length > 0) {
            const lastItem = this._items[this._items.length - 1];

            this._backButtonItem = lastItem;
            this._backButtonCaption = lastItem.get(options.displayProperty);

            // containerWidth is equal to 0, if path is inside hidden node. (for example switchableArea)
            if (this._items?.length > 1) {
                this._breadCrumbsItems = this._items.slice(0, this._items.length - 1);
                this._breadCrumbsClass = 'controls-BreadCrumbsPath__breadCrumbs_short';
                this._isHomeVisible = true;

                // Ограничиваем ширину только в случае отображения на одной линии кнопки назад и крошек
                if (options.displayMode === 'default') {
                    this._updateBreadCrumbsClasses(options, receivedState, getTextWidth);
                }
            } else {
                clearCrumbsView();
            }
        } else {
            this._backButtonItem = null;
            this._backButtonCaption = '';

            clearCrumbsView();
        }
    }

    static _styles: string[] = ['Controls/_breadcrumbs/resources/FontLoadUtil'];
    static getDefaultOptions(): object {
        return {
            displayProperty: 'title',
            root: null,
            backButtonIconStyle: 'primary',
            backButtonFontColorStyle: 'secondary',
            showActionButton: true,
            displayMode: 'default',
            fontSize: 'xs'
        };
    }
}

Object.defineProperty(BreadCrumbsPath, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return BreadCrumbsPath.getDefaultOptions();
   }
});

/**
 * @name Controls/_breadcrumbs/HeadingPath#backButtonFontSize
 * @cfg {String} Размер шрифта кнопки "Назад".
 * @demo Controls-demo/BreadCrumbs/backButtonFontSize/Index
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#backButtonNewIcon
 * @cfg {Boolean} Отображение кнопки "Назад" в новом дизайне.
 * @default false
 * @demo Controls-demo/BreadCrumbs/newIcon/Index
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#backButtonIconStyle
 * @cfg {String} Стиль отображения иконки кнопки "Назад".
 * @see Controls/_heading/Back#iconStyle
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#backButtonFontColorStyle
 * @cfg {String} Стиль цвета кнопки "Назад".
 * @see Controls/_heading/Back#fontColorStyle
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#displayMode
 * @cfg {Boolean} Отображение крошек в несколько строк
 * @variant default
 * @variant multiline
 * @default default
 * @demo Controls-demo/BreadCrumbs/DisplayMode/Index
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#fontSize
 * @cfg
 * @demo Controls-demo/BreadCrumbs/FontSize/Index
 */

/**
 * @event Происходит при клике на кнопку "Просмотр записи".
 * @name Controls/_breadcrumbs/HeadingPath#arrowActivated
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 */

/*
 * @event Happens after clicking the button "View Model".
 * @name Controls/_breadcrumbs/HeadingPath#arrowActivated
 * @param {UICommon/Events:SyntheticEvent} eventObject The event descriptor.
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#showActionButton
 * @cfg {Boolean} Определяет, должна ли отображаться стрелка рядом с кнопкой "Назад".
 * @default
 * true
 */

/*
 * @name Controls/_breadcrumbs/HeadingPath#showActionButton
 * @cfg {Boolean} Determines whether the arrow near "back" button should be shown.
 * @default
 * true
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#afterBackButtonTemplate
 * @cfg {Function|string} Шаблон, который расположен между кнопкой назад и хлебными крошками
 * @example
 * <pre>
 *    <Controls.breadcrumbs:HeadingPath
 *          items="{{_items}}"
 *          parentProperty="parent"
 *          keyProperty="id"
 *          on:itemClick="_onItemClick()">
 *       <ws:afterBackButtonTemplate>
 *          <h3>Custom content</h3>
 *       </ws:afterBackButtonTemplate>
 *    </Controls.breadcrumbs:HeadingPath>
 * </pre>
 */
export default BreadCrumbsPath;
