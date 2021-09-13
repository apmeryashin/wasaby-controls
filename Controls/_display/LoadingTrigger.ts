import CollectionItem, { IOptions as ICollectionOptions } from 'Controls/_display/CollectionItem';

export type TLoadingTriggerPosition = 'top'|'bottom';

// триггер находится за индикатором, чтобы загрузка срабатывала при подскролле к индикатору,
// делаем оффсет равный высоте индикатора
export const DEFAULT_TOP_TRIGGER_OFFSET = 47;
export const DEFAULT_BOTTOM_TRIGGER_OFFSET = 48;

export interface IOptions extends ICollectionOptions<null> {
    position: TLoadingTriggerPosition;
}

export default class LoadingTrigger extends CollectionItem<null> {
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    protected _$position: TLoadingTriggerPosition;

    constructor(options: IOptions) {
        super(options);
    }

    get key(): string {
        return this._instancePrefix + this._$position;
    }

    getClasses(): string {
        return 'controls-BaseControl__loadingTrigger';
    }

    getQAData(marker?: boolean): string {
        return this.key;
    }
}

Object.assign(LoadingTrigger.prototype, {
    'Controls/display:LoadingTrigger': true,
    _moduleName: 'Controls/display:LoadingTrigger',
    _instancePrefix: 'loading-trigger-',
    _$position: null
});
