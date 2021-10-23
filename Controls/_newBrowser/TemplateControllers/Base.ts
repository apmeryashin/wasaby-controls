import {VersionableMixin, OptionsToPropertyMixin} from 'Types/entity';
import {IBrowserViewConfig} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {IOptions} from 'Controls/_newBrowser/interfaces/IOptions';
import {mixin} from 'Types/util';
import {TreeItem} from 'Controls/display';

export interface ITemplateProperties {
    descriptionProperty: string;
    gradientColorProperty: string;
    imageProperty: string;
}
export interface ITemplateControllerOptions {
    listConfiguration: IBrowserViewConfig;
    templateProperties: ITemplateProperties;
}

export default abstract class BaseTemplateController<T, V extends TreeItem = TreeItem> extends
    mixin<VersionableMixin>(
        VersionableMixin,
        OptionsToPropertyMixin
) {
    protected _$listConfiguration: IBrowserViewConfig = null;
    protected _$templateProperties: ITemplateProperties = null;
    protected _viewModeConfig: T;

    constructor(options: ITemplateControllerOptions) {
        super();
        OptionsToPropertyMixin.apply(this, arguments);
        VersionableMixin.apply(this, arguments);
        this._viewModeConfig = this._getViewModeConfig();
    }

    get imageProperty(): string {
        return this._$templateProperties.imageProperty;
    }

    getDescription(item: TreeItem): string {
        return item.contents.get(this.getDescriptionProperty(item));
    }

    getDescriptionLines(item: TreeItem): number {
        const config = this._isNode(item) ? this._viewModeConfig.node : this._viewModeConfig.leaf;
        return config.descriptionLines;
    }

    getDescriptionProperty(item: TreeItem): string {
        return this._$templateProperties.descriptionProperty;
    }

    protected _isNode(item: V): boolean {
        return item.isNode();
    }

    protected abstract _getViewModeConfig(): T;
}
