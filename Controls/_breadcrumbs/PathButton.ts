import {detection} from 'Env/Env';
import {IBody} from './PathButton/Body';
import {Path} from 'Controls/dataSource';
import {Control, TemplateFunction} from 'UI/Base';
import {SlidingPanelOpener, StickyOpener} from 'Controls/popup';
import {IPathButton} from 'Controls/_breadcrumbs/PathButton/interfaces';
import * as template from 'wml!Controls/_breadcrumbs/PathButton/PathButton';

/**
 * Контрол кнопки меню для хлебных крошек. При клике открывается popup со списком всех узлов в виде дерева.
 *
 * Список узлов запрашивается через метод {@link Types/source:ICrud#query query} указанный в переданном в опциях {@link Controls/breadcrumbs:IPathButton#source source}. При запросе данных в фильтр автоматически подставляется параметр <b>"Только узлы": true</b>. Если указан кастомный {@link Controls/breadcrumbs:IPathButton#filter фильтр}, то параметр "Только узлы" так же будет добавлен к нему.
 *
 * @demo Controls-demo/breadCrumbs_new/PathButton/Index
 *
 * @extends UI/Base:Control
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export default class PathButton extends Control<IPathButton> {
    //region base props
    protected _template: TemplateFunction = template;
    //endregion

    //region private props
    private _stickyMenu: StickyOpener;

    private _slidingMenu: SlidingPanelOpener;
    //endregion

    //region life circle hooks
    protected _afterMount(): void {
        this._stickyMenu = new StickyOpener();
        this._slidingMenu = new SlidingPanelOpener();
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
        detection.isMobilePlatform ? this._openSlidingMenu() : this._openStickyMenu();
    }

    /**
     * Закрывает открытое ранее меню
     */
    protected _closeMenu(): void {
        detection.isMobilePlatform ? this._slidingMenu.close() : this._stickyMenu.close();
    }

    /**
     * Открывает sticky панель со списком каталогов
     */
    private _openStickyMenu(): Promise<void> {
        return this._stickyMenu.open({
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore - не видит _container
            target: this._container,

            opener: this,
            maxWidth: 700,

            backgroundStyle: 'default',
            targetPoint: {
                vertical: 'top',
                horizontal: 'right'
            },
            direction: {
                vertical: 'bottom',
                horizontal: 'right'
            },
            template: 'wml!Controls/_breadcrumbs/PathButton/StickyPanel',
            templateOptions: this._getPanelTemplateOptions(),
            eventHandlers: this._getPanelEventHandlers()
        });
    }

    /**
     * Открывает sliding панель со списком каталогов
     */
    private _openSlidingMenu(): void {
        this._slidingMenu.open({
            modal: true,
            slidingPanelOptions: {
                minHeight: 100,
                position: 'bottom',
                autoHeight: true
            },
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            template: 'wml!Controls/_breadcrumbs/PathButton/SlidingPanel',
            templateOptions: this._getPanelTemplateOptions(),
            eventHandlers: this._getPanelEventHandlers()
        });
    }

    /**
     * Возвращает объект с опциями для {@link BodyComponent}, отображаемого в popup
     */
    private _getPanelTemplateOptions(): IBody {
        return {
            path: this._options.path,
            source: this._options.source,
            filter: this._options.filter,
            keyProperty: this._options.keyProperty,
            nodeProperty: this._options.nodeProperty,
            parentProperty: this._options.parentProperty,
            displayProperty: this._options.displayProperty
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
}
