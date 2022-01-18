import * as DataContext from 'Core/DataContext';

export interface IListScrollContextOptions {
    setScrollContainerViewMode: (state: boolean) => void;
}

export default class ListScrollContext extends DataContext {
    _moduleName: string = 'Controls/_scroll/ListScrollContext';
    setScrollContainerViewMode: IListScrollContextOptions['setScrollContainerViewMode'];

    constructor(options: IListScrollContextOptions) {
        super();
        this.setScrollContainerViewMode = options.setScrollContainerViewMode;
    }
}

export interface IListScrollContext {
    listScrollContext?: ListScrollContext;
}
