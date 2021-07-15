// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls-demo/treeGridNew/Forwarding/Index';
import * as nodeTemplate from 'wml!Controls-demo/treeGridNew/Forwarding/NodeTemplate';
import {data} from './Data';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, TemplateFunction} from 'UI/Base';
import {IGroupNodeColumn} from 'Controls/treeGrid';
import {IHeaderCell, TColspanCallbackResult} from 'Controls/grid';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {
    Container as ScrollContainer,
    IntersectionObserverSyntheticEntry
} from 'Controls/scroll';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _children: {
        scrollContainer: ScrollContainer
    };

    protected _viewSource: HierarchicalMemory;
    protected _expandedItems: CrudEntityKey[] = [];
    protected _collapsedItems: CrudEntityKey[] = [];
    protected _header: IHeaderCell[] = [
        {
            caption: 'Name'
        },
        {
            caption: 'Price'
        },
        {
            caption: 'Count'
        },
        {
            caption: 'Total'
        }
    ];
    protected _columns: IGroupNodeColumn[] = [
        {
            width: '200px',
            displayProperty: 'name',
            template: nodeTemplate,
            templateOptions: {
                threshold: [0, 1],
                // 24px высота шапки
                rootMargin: '-24px 0px 0px 0px'
            }
        },
        {
            width: '100px',
            align: 'right',
            displayType: 'number',
            displayProperty: 'price'
        },
        {
            width: '100px',
            align: 'right',
            displayType: 'number',
            displayProperty: 'count'
        },
        {
            width: '100px',
            align: 'right',
            displayType: 'number',
            displayProperty: 'total'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            data,
            keyProperty: 'id',
            parentProperty: 'parent'
        });
    }

    protected _intersectHandler(
        event: SyntheticEvent,
        entries: IntersectionObserverSyntheticEntry[]
    ): void {

        const headerHeight = this._children.scrollContainer.getHeadersHeight('top', 'fixed');
        const groupsEntries = entries.filter((e) => {
            if (!e.data) {
                return false;
            }

            const name = (e.data as Model).get('name');
            // getBoundingClientRect для ScrollContainer
            const rootBounds = e.nativeEntry.rootBounds;
            // getBoundingClientRect для элемента списка, который пересек границы ScrollContainer
            const targetBounds = e.nativeEntry.boundingClientRect;

            const intersect = e.nativeEntry.intersectionRatio > 0 && e.nativeEntry.intersectionRatio < 1;
            const intersectTop = targetBounds.top < rootBounds.top && targetBounds.bottom > rootBounds.top;
            const intersectBottom = targetBounds.bottom > rootBounds.bottom && targetBounds.top < rootBounds.bottom;
            const below = targetBounds.top >= rootBounds.bottom;
            const above = targetBounds.bottom <= rootBounds.top;
            const inside = !below && !above && !intersect;

            const result = {
                name, intersect, intersectTop, intersectBottom, above, below, inside
            };
            Object.keys(result).forEach((k) => {
                if (!result[k]) {
                    delete result[k];
                }
            });

            console.log(result);

            return intersectTop || above;
        });

        if (!groupsEntries.length) {
            return;
        }

        const newCaption = this._children.scrollContainer.getScrollTop() === 0 ? 'Name' : groupsEntries[0].data.get('name');

        this._header = [...this._header];
        this._header[0] = {
            ...this._header[0],
            caption: newCaption
        };
        console.log(`caption updated to ${newCaption}`);
    }

    protected _colspanCallback(
        item: Model,
        column: IGroupNodeColumn,
        columnIndex: number,
        isEditing: boolean
    ): TColspanCallbackResult {
        if (item.get('nodeType') === 'group' && columnIndex === 0) {
            return 3;
        }
        return 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
