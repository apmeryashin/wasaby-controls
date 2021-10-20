import {
    IScrollControllerOptions,
    ScrollController
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

export function initTest(options: Partial<IScrollControllerOptions>): ScrollController {
    return new ScrollController({
        viewportSize: 0,
        scrollTop: 0,
        indexesChangedCallback: () => null,
        environmentChangedCallback: () => null,
        activeElementChangedCallback: () => null,
        itemsEndedCallback: () => null,
        itemsContainer: null,
        itemsQuerySelector: '',
        listContainer: null,
        listControl: null,
        triggersQuerySelector: '',
        virtualScrollConfig: {},
        // TODO не должно быть этих опций(в интерфейс попали из extends)
        triggersVisibility: {top: false, bottom: false},
        itemsSizes: [],
        triggersOffsets: {top: 0, bottom: 0},
        ...options
    });
}