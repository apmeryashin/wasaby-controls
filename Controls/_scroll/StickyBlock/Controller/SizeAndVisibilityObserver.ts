import {ResizeObserverUtil} from 'Controls/sizeUtils';
import {isHidden} from 'Controls/_scroll/StickyBlock/Utils';
import {getClosestControl} from 'UI/NodeCollector';
import StickyBlock from 'Controls/_scroll/StickyBlock';
import Group from 'Controls/_scroll/StickyBlock/Group';

interface IHeightEntry {
    key: HTMLElement;
    value: number;
}

export const enum STACK_OPERATION {
    add = 'add',
    remove = 'remove'
}

export default class SizeAndVisibilityObserver {
    private _resizeObserver: ResizeObserverUtil;
    protected _initialized: boolean = false;
    protected _container: HTMLElement;
    protected _elementsHeight: IHeightEntry[] = [];

    protected _resizeHeadersCallback: Function;
    protected _resizeCallback: Function;

    private _headers: object;

    constructor(resizeHeadersCallback: Function, resizeCallback: Function, headers: object) {
        this._resizeHeadersCallback = resizeHeadersCallback;
        this._headers = headers;
        this._resizeCallback = resizeCallback;
        this._resizeObserver = new ResizeObserverUtil(
            undefined, this._resizeObserverCallback.bind(this), this._resizeHandler.bind(this));
    }

    init(container: HTMLElement): void {
        this._initialized = true;
        this.updateContainer(container);
        this._resizeObserver.initialize();
    }

    destroy(): void {
        this._resizeObserver.terminate();
    }

    updateContainer(container: HTMLElement): void {
        this._container = container;
    }

    observe(header: StickyBlock): void {
        // Подпишемся на изменение размеров всех заголовков 1 раз после того как они все зарегистрируются.
        setTimeout(() => {
            const stickyHeaders = this._getStickyHeaderElements(header);
            stickyHeaders.forEach((elem: HTMLElement) => {
                this._resizeObserver.observe(elem);
            });
        });
    }

    unobserve(header: StickyBlock): void {
        const stickyHeaders = this._getStickyHeaderElements(header);
        stickyHeaders.forEach((elem: HTMLElement) => {
            this._resizeObserver.unobserve(elem);
            this._deleteElement(elem);
        });
    }

    controlResizeHandler(): void {
        this._resizeObserver.controlResizeHandler();
    }

    private _isHeaderOfGroup(id: number): boolean {
        return !this._headers[id];
    }

    private _isGroup(id: string): boolean {
        return this._headers[id].inst instanceof Group;
    }

    private _getGroupByHeader(header: StickyBlock) {
        for (const headerId in this._headers) {
            if (this._isGroup(headerId)) {
                const groupChildren = this._headers[headerId].inst.getChildrenHeaders();
                const isHeaderGroup = groupChildren.find((groupHeader) => groupHeader.id === header.index);
                if (isHeaderGroup) {
                    return this._headers[headerId];
                }
            }
        }
    }

    private _groupInObject(group: Group, object: object): boolean {
        const groupInObject = Object.entries(object).find(([, updateGroup]) => updateGroup.index === group.index);
        return !!groupInObject;
    }

    private _resizeObserverCallback(entries: any): void {
        // В момент переключения по вкладкам в мастер детейле на ноде может не быть замаунчен стикиБлок
        // Контроллер инициализируется при наведении мыши или когда заголовки зафиксированы.
        if (isHidden(this._container) || !this._initialized) {
            return;
        }

        let heightChanged = false;
        let operation;
        let groupHeader;
        const updateHeaders = {};
        const updateGroups = {};
        for (const entry of entries) {
            const header = this._getHeaderFromNode(entry.target);

            if (header) {
                const heightEntry = this._getElementHeightEntry(entry.target);
                if (heightEntry) {
                    operation = this._getOperationForHeadersStack(entry.contentRect.height, heightEntry.value);
                }

                // Если заголовок состоит в группе и у него изменился размер, то нужно будет пересчитать top'ы всех
                // заголовков группы.
                if (this._isHeaderOfGroup(header.index)) {
                    groupHeader = this._getGroupByHeader(header);
                    const groupInUpdateGroups = this._groupInObject(groupHeader, updateGroups);
                    if (!groupInUpdateGroups) {
                        updateGroups[groupHeader.id] = groupHeader;
                    }
                }

                if (operation) {
                    if (this._isHeaderOfGroup(header.index)) {
                        const groupInUpdateHeaders = this._groupInObject(groupHeader, updateHeaders);
                        if (!groupInUpdateHeaders) {
                            updateHeaders[groupHeader.id] = {
                                header: groupHeader,
                                operation
                            };
                        }
                    } else {
                        updateHeaders[header.index] = {
                            header: this._headers[header.index],
                            operation
                        };
                    }
                }
            }

            heightChanged = this.updateElementHeight(entry.target, entry.contentRect.height) || heightChanged;
        }

        if (heightChanged) {
            this._resizeHeadersCallback(updateHeaders);
            for (const groupId of Object.keys(updateGroups)) {
                updateGroups[groupId].inst.resizeHandler();
            }
        }
    }

    updateElementHeight(element: HTMLElement, height: number): boolean {
        let heightChanged: boolean = false;
        const heightEntry: IHeightEntry = this._getElementHeightEntry(element);

        if (heightEntry) {
            if (heightEntry.value !== height) {
                heightEntry.value = height;
                heightChanged = true;
            }
        } else {
            // ResizeObserver всегда кидает событие сразу после добавления элемента. Не будем генерировать
            // событие, а просто сохраним текущую высоту если это первое событие для элемента и высоту
            // этого элемента мы еще не сохранили.
            this._elementsHeight.push({key: element, value: height});
        }
        return heightChanged;
    }

    private _getHeaderFromNode(container: HTMLElement): any {
        const control = getClosestControl(container);
        if (control?._container === container) {
            // если контейнер ближайшего контрола совпадает с таргетом - это хедер
            return control;
        }
    }

    private _getElementHeightEntry(element: HTMLElement): IHeightEntry {
        return this._elementsHeight.find((item: IHeightEntry) => item.key === element);
    }

    private _getOperationForHeadersStack(newHeight: number, oldHeight: number): STACK_OPERATION {
        let result;
        if (newHeight === 0 && oldHeight !== 0) {
            result = STACK_OPERATION.remove;
        } else if (newHeight !== 0 && oldHeight === 0) {
            result = STACK_OPERATION.add;
        }
        return result;
    }

    private _getStickyHeaderElements(header: StickyBlock): NodeListOf<HTMLElement> {
        if (header.getChildrenHeaders) {
            return header.getChildrenHeaders().map(h => h.inst.getHeaderContainer());
        } else {
            return [header.getHeaderContainer()];
        }
    }

    private _deleteElement(element: HTMLElement): void {
        this._elementsHeight = this._elementsHeight.filter((item) => item.key !== element);
    }

    private _resizeHandler(): void {
        this._resizeCallback();
    }
}
