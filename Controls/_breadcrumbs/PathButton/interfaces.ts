import {IControlOptions} from 'UI/Base';
import {Path} from 'Controls/dataSource';
import {
    ICaptionOptions,
    IFilterOptions, IHeightOptions,
    IHierarchyOptions, INavigationOptions, INavigationPageSourceConfig, INavigationPositionSourceConfig,
    ISortingOptions,
    ISourceOptions
} from 'Controls/interface';
import IItemTemplateOptions from 'Controls/_baseList/interface/ItemTemplate';
import {ITreeControlOptions} from 'Controls/tree';

/**
 * Структура объекта конфигурации компонента {@link Controls/breadcrumbs:PathButton}
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
        IItemTemplateOptions,
        ITreeControlOptions,
        ICaptionOptions,
        ISortingOptions,
        INavigationOptions<INavigationPositionSourceConfig | INavigationPageSourceConfig>,
        IHeightOptions {

    /**
     * @cfg {Controls/breadcrumbs#Path} Текущий отображаемый путь
     */
    path?: Path;
}
