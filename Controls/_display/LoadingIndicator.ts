import CollectionItem from 'Controls/_display/CollectionItem';
import { TemplateFunction } from 'UI/Base';

export type TLoadingIndicatorPosition = 'top'|'bottom'|'global';

export default class LoadingIndicator extends CollectionItem<null> {
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    protected _$position: TLoadingIndicatorPosition;

    get key(): string {
        return this._instancePrefix + this._$position;
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        return 'Controls/list:LoadingIndicatorItemTemplate';
    }

    getClasses(): string {
        return 'controls-BaseControl__loadingIndicator';
    }

    getQAData(marker?: boolean): string {
        return this.key;
    }

    isTopIndicator(): boolean {
        return this._$position === 'top';
    }

    isBottomIndicator(): boolean {
        return this._$position === 'bottom';
    }

    isGlobalIndicator(): boolean {
        return this._$position === 'global';
    }
}

Object.assign(LoadingIndicator.prototype, {
    'Controls/display:LoadingIndicator': true,
    _moduleName: 'Controls/display:LoadingIndicator',
    _instancePrefix: 'loading-indicator-',
    _$position: null,
    _$triggerOffset: 0
});