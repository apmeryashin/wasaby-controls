import * as DataContext from 'Core/DataContext';

export interface IListScrollContextOptions {
    setScrollContainerViewMode: (state: 'default' | 'custom') => void;
    canHorizontalScroll: boolean;
}

export default class ListScrollContext extends DataContext {
    _moduleName: string = 'Controls/_scroll/ListScrollContext';
    _setScrollContainerViewModeFromOptions: IListScrollContextOptions['setScrollContainerViewMode'];
    _scrollContainerViewMode: 'default' | 'custom' = 'default';
    setScrollContainerViewMode: IListScrollContextOptions['setScrollContainerViewMode'];
    canHorizontalScroll: IListScrollContextOptions['canHorizontalScroll'];

    constructor(options: IListScrollContextOptions) {
        super();
        this._updateOptions(options);
    }

    updateOptions(options: Partial<IListScrollContextOptions>): boolean {
        return this._updateOptions(options, true);
    }

    shouldUpdateConsumers(options: Partial<IListScrollContextOptions>): boolean {
        const optionChangedInListWithoutEnabledColumnScroll = !(
            'canHorizontalScroll' in options &&
            options.canHorizontalScroll !== this.canHorizontalScroll &&
            this._scrollContainerViewMode !== 'custom'
        );
        return optionChangedInListWithoutEnabledColumnScroll;
    }

    _updateOptions(options: Partial<IListScrollContextOptions>, updateConsumers?: true): boolean {
        let needUpdate = false;

        if ('canHorizontalScroll' in options && options.canHorizontalScroll !== this.canHorizontalScroll) {
            this.canHorizontalScroll = options.canHorizontalScroll;
            needUpdate = this._scrollContainerViewMode === 'custom';
        }

        if (
            'setScrollContainerViewMode' in options &&
            options.setScrollContainerViewMode !== this._setScrollContainerViewModeFromOptions
        ) {
            this._setScrollContainerViewModeCallback(options.setScrollContainerViewMode);
            needUpdate = true;
        }

        if (needUpdate && updateConsumers) {
            // Core/DataContext написан на js, в итоге с него не цепляются типы
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            this.updateConsumers();
        }

        return needUpdate;
    }

    private _setScrollContainerViewModeCallback(cb: IListScrollContextOptions['setScrollContainerViewMode']): void {
        this._setScrollContainerViewModeFromOptions = cb;
        this.setScrollContainerViewMode = (mode: 'default' | 'custom') => {
            this._scrollContainerViewMode = mode;
            this._setScrollContainerViewModeFromOptions(mode);
        };
    }
}

export interface IListScrollContext {
    listScrollContext?: ListScrollContext;
}
