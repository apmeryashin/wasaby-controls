import {ILoadDataResult} from 'Controls/dataSource';
import {TFilter, Direction} from 'Controls/interface';
import {RecordSet} from 'Types/collection';

export interface IListStore extends ILoadDataResult {
    reload: () => Promise<RecordSet|Error>;
    setFilter: (filter: TFilter) => void;
    loadToDirection: (direction: Direction) => Promise<RecordSet|Error>;
}

export default function(initialState: ILoadDataResult): IListStore {
    function reload(): Promise<RecordSet|Error> {
        return initialState.sourceController.reload();
    }

    function setFilter(filter: TFilter|object): void {
        initialState.sourceController.setFilter(filter);
    }

    function loadToDirection(direction: Direction): Promise<RecordSet|Error> {
        return initialState.sourceController.load(direction);
    }

    return {
        items: initialState.data,
        sorting: initialState.sorting,
        collapsedGroups: initialState.collapsedGroups,
        navigation: initialState.navigation,
        source: initialState.source,
        setFilter,
        reload,
        loadToDirection
    };
}
