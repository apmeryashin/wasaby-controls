import {
    IScrollControllerOptions,
    ScrollController
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import { JSDOM } from 'jsdom';

export function initTest(options: Partial<IScrollControllerOptions>): ScrollController {
    return new ScrollController({
        viewportSize: 0,
        contentSize: 0,
        scrollPosition: 0,
        totalCount: 0,
        givenItemsSizes: null,
        topTriggerOffsetCoefficient: 0.3,
        bottomTriggerOffsetCoefficient: 0.3,
        indexesChangedCallback: (result) => null,
        indexesInitializedCallback: (result) => null,
        placeholdersChangedCallback: (result) => null,
        hasItemsOutRangeChangedCallback: (result) => null,
        activeElementChangedCallback: (result) => null,
        itemsEndedCallback: () => null,
        itemsContainer: null,
        itemsQuerySelector: '',
        listContainer: null,
        listControl: null,
        triggersQuerySelector: '',
        virtualScrollConfig: {},
        triggersVisibility: {backward: false, forward: false},
        ...options
    });
}

export function getItemsContainer(): HTMLElement {
    const dom = new JSDOM('');
    const items = dom.window.document.createElement('div');
    return items;
}
