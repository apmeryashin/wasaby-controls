import ListMenuAction from 'Controls/_actions/MassActions/ListMenuAction';
import {RecordSet} from 'Types/collection';

const VIEW_MODE_ITEMS = {
    list: {
        id: 'list',
        icon: 'icon-ArrangeList',
        iconSize: 'm',
        parent: 'viewMode',
        title: 'Лист'
    },
    tile: {
        id: 'tile',
        icon: 'icon-ArrangePreview',
        iconSize: 'm',
        parent: 'viewMode',
        title: 'Плитка'
    },
    table: {
        id: 'table',
        icon: 'icon-Table',
        iconSize: 'm',
        parent: 'viewMode',
        title: 'Таблица'
    }
};

export default class ViewModeAction extends ListMenuAction {
    constructor(options) {
        super(options);
        this.icon = 'icon-ArrangeList';
        this.title = 'Вид';
    }

    load(): Promise<RecordSet> {
        const items = new RecordSet({
            keyProperty: 'id',
            rawData: [VIEW_MODE_ITEMS.table, VIEW_MODE_ITEMS.tile, VIEW_MODE_ITEMS.list]
        });
        return Promise.resolve(items);
    }

    execute(options): Promise<unknown> {
        console.log('view');
    }
}
Object.assign(ViewModeAction.prototype, {
    prefetchResultId: 'viewMode',
    icon: 'icon-ArrangeList'
});
