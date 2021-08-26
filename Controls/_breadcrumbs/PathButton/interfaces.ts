import {IControlOptions} from 'UI/Base';
import {Path} from 'Controls/dataSource';
import {ISourceOptions} from 'Controls/_interface/ISource';
import {IHierarchyOptions} from 'Controls/_interface/IHierarchy';
import {IFilterOptions} from 'Controls/_interface/IFilter';
import IItemTemplateOptions from 'Controls/_baseList/interface/ItemTemplate';

/**
 * Структура объекта конфигурации компонента {@link Controls/breadcrumbs:PathButton}
 *
 * @implements Controls/interface#ISource
 * @implements Controls/interface#IHierarchy
 * @implements Controls/interface#IFilter
 *
 * @ignoreOptions dataLoadCallback
 * @ignoreOptions dataLoadErrback
 * @ignoreOptions nodeHistoryId
 * @ignoreOptions nodeHistoryType
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IPathButton
    extends
        IControlOptions,
        ISourceOptions,
        IHierarchyOptions,
        IFilterOptions,
        IItemTemplateOptions {

    /**
     * @cfg {Controls/breadcrumbs#Path} Текущий отображаемый путь
     */
    path?: Path;
}
