import {detection} from 'Env/Env';
import {IBody} from './PathButton/Body';
import {Path} from 'Controls/dataSource';
import {Control, TemplateFunction} from 'UI/Base';
import {SlidingPanelOpener} from 'Controls/popup';
import {IPathButton} from 'Controls/_breadcrumbs/PathButton/interfaces';
import * as template from 'wml!Controls/_breadcrumbs/PathButton/PathButton';
import * as rk from 'i18n!SBIS3';
import {descriptor as EntityDescriptor} from 'Types/entity';

/**
 * Контрол кнопки меню для хлебных крошек. При клике открывается popup со списком всех узлов в виде дерева.
 *
 * Список узлов запрашивается через метод {@link Types/source:ICrud#query query} указанный в переданном в опциях {@link Controls/breadcrumbs:IPathButton#source source}. При запросе данных в фильтр автоматически подставляется параметр <b>"Только узлы": true</b>. Если указан кастомный {@link Controls/breadcrumbs:IPathButton#filter фильтр}, то параметр "Только узлы" так же будет добавлен к нему.
 *
 * @demo Controls-demo/breadCrumbs_new/PathButton/Index
 *
 * @extends UI/Base:Control
 * @implements Controls/interface:ISource
 * @implements Controls/interface:IHierarchy
 * @implements Controls/interface:IFilter
 * @implements Controls/tree:ITreeControl
 *
 * @ignoreOptions dataLoadCallback
 * @ignoreOptions dataLoadErrback
 * @ignoreOptions nodeHistoryId
 * @ignoreOptions nodeHistoryType
 * @ignoreOptions expandByItemClick
 * @ignoreOptions expandedItems
 * @ignoreOptions collapsedItems
 * @ignoreOptions nodeFooterTemplate
 * @ignoreOptions nodeFooterVisibilityCallback
 * @ignoreOptions searchBreadCrumbsItemTemplate
 * @ignoreOptions expanderVisibility
 * @ignoreOptions nodeLoadCallback
 * @ignoreOptions deepReload
 * @ignoreOptions selectAncestors
 * @ignoreOptions selectDescendants
 * @ignoreOptions markItemByExpanderClick
 * @ignoreOptions expanderSize
 * @ignoreOptions expanderPosition
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export default class PathButton extends Control<IPathButton> {
    //region base props
    protected _options: IPathButton;
    protected _template: TemplateFunction = template;
    //endregion

    //region template props
    protected _size: string;
    //endregion

    //region private props
    private _menu: SlidingPanelOpener;
    //endregion

    //region life circle hooks
    protected _afterMount(): void {
        this._menu = new SlidingPanelOpener();
    }
    //endregion

    /**
     * Обработчик изменения корня из {@link BodyComponent}, отображаемого в popup
     */
    protected _resultHandler(path: Path): void {
        this._notify('pathChanged', [path], {bubbling: false});
        this._closeMenu();
    }

    //region open/close menu
    /**
     * В зависимости от текущего устройства открывает либо StickyPanel либо SlidingPanel
     */
    protected _openMenu(): void {
        this._menu.open({
            modal: detection.isPhone,

            slidingPanelOptions: {
                minHeight: 100,
                position: 'bottom',
                autoHeight: true
            },

            desktopMode: 'sticky',
            dialogOptions: {
                // tslint:disable-next-line:ban-ts-ignore
                // @ts-ignore - не видит _container
                target: this._container,

                opener: this,
                maxWidth: 700,

                actionOnScroll: 'close',
                closeOnOutsideClick: true,
                backgroundStyle: 'default',
                targetPoint: {
                    vertical: 'top',
                    horizontal: 'left'
                },
                direction: {
                    vertical: 'bottom',
                    horizontal: 'right'
                },
                offset: {
                    horizontal: -8,
                    vertical: -9
                },
                fittingMode: {
                    vertical: 'overflow',
                    horizontal: 'fixed'
                }
            },

            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            template: 'wml!Controls/_breadcrumbs/PathButton/SlidingPanel',
            templateOptions: this._getPanelTemplateOptions(),
            eventHandlers: this._getPanelEventHandlers()
        });
    }

    /**
     * Закрывает открытое ранее меню
     */
    protected _closeMenu(): void {
        this._menu.close();
    }

    /**
     * Возвращает объект с опциями для {@link BodyComponent}, отображаемого в popup
     */
    private _getPanelTemplateOptions(): IBody {
        return {
            caption: (this._options.caption || rk('На главную')) as string,
            path: this._options.path,
            source: this._options.source,
            filter: this._options.filter,
            sorting: this._options.sorting,
            navigation: this._options.navigation,
            keyProperty: this._options.keyProperty,
            nodeProperty: this._options.nodeProperty,
            parentProperty: this._options.parentProperty,
            displayProperty: this._options.displayProperty,
            hasChildrenProperty: this._options.hasChildrenProperty
        };
    }

    /**
     * Возвращает объект с обработчиками события для {@link BodyComponent}, отображаемого в popup
     */
    private _getPanelEventHandlers(): object {
        return {
            onResult: this._resultHandler.bind(this)
        };
    }
    //endregion

    static getDefaultOptions(): object {
        return {
            inlineHeight: 'm'
        };
    }

    static getOptionTypes(): object {
        return {
            inlineHeight: EntityDescriptor(String).oneOf([
                's',
                'm',
                'l'
            ])
        };
    }
}
