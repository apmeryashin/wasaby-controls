import {EventUtils} from 'UI/Events';
import {Path} from 'Controls/_dataSource/calculatePath';
import {IHeaderCell} from 'Controls/grid';
import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_explorer/PathController/PathWrapper';
import {TExplorerViewMode} from 'Controls/_explorer/interface/IExplorer';

interface IOptions extends IControlOptions {
    viewMode?: TExplorerViewMode;

    breadCrumbsItems?: Path;
    header?: IHeaderCell[];

    needShadow?: boolean;
    stickyHeader?: boolean;

    style?: string;
    backgroundStyle?: string;

    rootVisible?: boolean;
    breadcrumbsVisibility?: 'hidden' | 'visible';
    afterBreadCrumbsTemplate?: string | TemplateFunction;

    /**
     * Временная опция, которая включает отображение крошек в новом дизайне
     * https://online.sbis.ru/opendoc.html?guid=bc6cb214-d119-4ae6-98b2-c147df660b46
     */
    feature1182709671?: boolean;
}

/**
 * * Определяет нужно ли рисовать хлебные крошки
 * * Определяет нужно ли выводить в хлебных крошках кнопку "Назад"
 */
export default class PathWrapper extends Control<IOptions> {
    protected _template: TemplateFunction = template;
    protected _needCrumbs: boolean = false;
    protected _withoutBackButton: boolean = false;
    protected _notifyHandler: typeof EventUtils.tmplNotify = EventUtils.tmplNotify;

    protected _beforeMount(options: IOptions): void {
        this._needCrumbs = PathWrapper._isNeedCrumbs(options);
        this._withoutBackButton = PathWrapper._isWithoutBackButton(options.header, options.viewMode);
    }

    protected _beforeUpdate(newOptions: IOptions): void {
        const viewModeChanged = this._options.viewMode !== newOptions.viewMode;
        const headerChanged = !GridIsEqualUtil.isEqualWithSkip(
            this._options.header,
            newOptions.header,
            { template: true }
        );

        if (
            headerChanged || viewModeChanged ||
            this._options.breadCrumbsItems !== newOptions.breadCrumbsItems ||
            this._options.rootVisible !== newOptions.rootVisible ||
            this._options.breadcrumbsVisibility !== newOptions.breadcrumbsVisibility
        ) {
            this._needCrumbs = PathWrapper._isNeedCrumbs(newOptions);
        }

        if (headerChanged || viewModeChanged) {
            this._withoutBackButton = PathWrapper._isWithoutBackButton(newOptions.header, newOptions.viewMode);
        }
    }

    isCrumbsVisible(options: IOptions): boolean {
        return PathWrapper._isNeedCrumbs(options);
    }

    private static _isNeedCrumbs(options: IOptions): boolean {
        if (options.breadcrumbsVisibility === 'hidden') {
            return false;
        }

        // В новом дизайне крошки видны всегда, т.к. там есть кнопка меню.
        // Кроме случая когда крошки явно скрыли через breadcrumbsVisibility, т.к.
        // в этом случае кто-то другой крошки показывает
        if (options.feature1182709671) {
            return true;
        }

        const items = options.breadCrumbsItems;
        return !!items &&
            (
                (!PathWrapper._isWithoutBackButton(options.header, options.viewMode) && items.length > 0) ||
                items.length > 1
            ) ||
            !!options.rootVisible;
    }

    private static _isWithoutBackButton(header: IHeaderCell[], viewMode: TExplorerViewMode): boolean {
        return (viewMode === 'table' || viewMode === 'search') &&
            !!(header && header[0] && (header[0] as any).isBreadCrumbs);
    }
}
