import * as DataContext from 'Core/DataContext';

export interface IListScrollContextOptions {
    setScrollContainerViewMode: (state: boolean) => void;
    canHorizontalScroll: boolean;
}

export default class ListScrollContext extends DataContext {
    _moduleName: string = 'Controls/_scroll/ListScrollContext';
    setScrollContainerViewMode: IListScrollContextOptions['setScrollContainerViewMode'];
    canHorizontalScroll: IListScrollContextOptions['canHorizontalScroll'];

    constructor(options: IListScrollContextOptions) {
        super();
        this._updateOptions(options, true);
    }

    updateOptions(options: Partial<IListScrollContextOptions>): void {
        this._updateOptions(options, true);
    }

    _updateOptions(options: Partial<IListScrollContextOptions>, updateConsumers?: true): void {
        let needUpdate = false;

        ['setScrollContainerViewMode', 'canHorizontalScroll'].forEach((optionName) => {
            if (optionName in options && options[optionName] !== this[optionName]) {
                this[optionName] = options[optionName];
                needUpdate = true;
            }
        });

        if (needUpdate) {
            // Core/DataContext написан на js, в итоге с него не цепляются типы
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            this.updateConsumers();
        }
    }
}

export interface IListScrollContext {
    listScrollContext?: ListScrollContext;
}
