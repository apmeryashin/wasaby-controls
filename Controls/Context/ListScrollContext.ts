import * as DataContext from 'Core/DataContext';

export interface IListScrollContextOptions {
    toggleHorizontalScrollCallback: (state: boolean) => void;
}

export default class ListScrollContext extends DataContext {
    _moduleName: string = 'Controls/_scroll/ListScrollContext';
    toggleHorizontalScrollCallback: IListScrollContextOptions['toggleHorizontalScrollCallback'];

    constructor(options: IListScrollContextOptions) {
        super();
        this.toggleHorizontalScrollCallback = options.toggleHorizontalScrollCallback;
    }
}

export interface IListScrollContext {
    listScrollContext?: ListScrollContext;
}
