import {IScrollParams} from 'Controls/baseList';
import {TreeControl, ITreeControlOptions} from 'Controls/tree';
import {GridControl, IGridControlOptions} from 'Controls/grid';
import {
    Controller as ListVirtualColumnScrollController,
    IControllerOptions as IListVirtualColumnScrollControllerOptions
} from 'Controls/horizontalScroll';
import {SyntheticEvent} from 'UI/Vdom';

type ListVirtualColumnScrollControllerCtor =
    new (options: IListVirtualColumnScrollControllerOptions) => ListVirtualColumnScrollController;

export interface ITreeGridControlOptions extends ITreeControlOptions, IGridControlOptions {}

export class TreeGridControl extends TreeControl<ITreeGridControlOptions> {
    private _listVirtualColumnScrollController?: ListVirtualColumnScrollController;
    private _contentWidth: number = 0;
    private _fixedColumnsWidth: number = 0;

    constructor(...args: unknown[]) {
        super(...args);
        this._doScrollUtil = this._doScrollUtil.bind(this);
    }

    protected _prepareItemsOnMount(self: this, newOptions: ITreeGridControlOptions): Promise<void> {
        super._prepareItemsOnMount(self, newOptions);
        if (newOptions.newColumnScroll) {
            newOptions.setScrollContainerViewMode('custom');
            return import('Controls/horizontalScroll').then((lib) => {
                this._createColumnScrollController(lib.Controller, {
                    ...newOptions,
                    virtualColumnScrollConfig: newOptions.virtualColumnScrollConfig || {
                        pageSize: newOptions.columns.length
                    }
                });
            });
        }
    }

    protected _afterMount(...args): void {
        super._afterMount(...args);
        if (this._listVirtualColumnScrollController) {
            this._updateFixedColumnsWidth();
            this._listVirtualColumnScrollController.setItemsContainer(this._getItemsContainer());
            this._listVirtualColumnScrollController.setListContainer(this._container);
        }
    }

    _beforeRender(...args): void {
        super._beforeRender(...args);
        if (this._listVirtualColumnScrollController) {
            const hasNotRenderedChanges =
                this._hasItemWithImageChanged || this._indicatorsController.hasNotRenderedChanges();
            this._listVirtualColumnScrollController.beforeRenderListControl(hasNotRenderedChanges);
        }
    }

    _afterRender(...args): void {
        super._afterRender(...args);
        this._listVirtualColumnScrollController?.afterRenderListControl();
    }

    _observeScrollHandler(...args: [SyntheticEvent<Event>, string, IScrollParams]): void {
        super._observeScrollHandler.apply(this, args);
        const [, eventName, params] = args;
        switch (eventName) {
            case 'horizontalScrollMoveSync':
                this._listVirtualColumnScrollController?.scrollPositionChange(params.scrollLeft);
                break;
            case 'horizontalViewportResize':
                this.viewportResizeHandler(params.clientHeight, params.rect, params.scrollTop);
                break;
        }
    }

    viewportResizeHandler(viewportHeight: number, viewportRect: DOMRect, scrollTop: number): void {
        super.viewportResizeHandler(viewportHeight, viewportRect, scrollTop);
        this._listVirtualColumnScrollController?.viewportResized(viewportRect.width);
    }

    scrollToLeft(): void {
        if (!this._options.newColumnScroll) {
            if (this._children.listView.scrollToLeft) {
                this._children.listView.scrollToLeft();
            }
        } else {
            // Implement it
            // this._listVirtualColumnScrollController?.scrollToItem(this.columns[0].displayProperty);
        }
    }

    scrollToRight(): void {
        if (!this._options.newColumnScroll) {
            if (this._children.listView.scrollToRight) {
                this._children.listView.scrollToRight();
            }
        } else {
            // Implement it
            // this._listVirtualColumnScrollController?.scrollToItem(
            //      this.columns[this.columns.length-1].displayProperty
            // );
        }
    }

    scrollToColumn(columnIndex: number): void {
        if (!this._options.newColumnScroll) {
            if (this._children.listView.scrollToColumn) {
                this._children.listView.scrollToColumn(columnIndex);
            }
        } else {
            // Implement it
            // this._listVirtualColumnScrollController?.scrollToItem(this.columns[columnIndex].displayProperty);
        }
    }

    protected _keyDownLeft(event: SyntheticEvent): void {
        if (this._options.newColumnScroll && event.nativeEvent.shiftKey) {
            this._listVirtualColumnScrollController.keyDownLeft().then(() => super._keyDownLeft(event));
        } else {
            super._keyDownLeft(event);
        }
    }

    protected _keyDownRight(event): void {
        if (this._options.newColumnScroll && event.nativeEvent.shiftKey) {
            this._listVirtualColumnScrollController.keyDownRight().then(() => super._keyDownLeft(event));
        } else {
            super._keyDownRight(event);
        }
    }

    private _doScrollUtil(position: number): void {
        this._notify('doHorizontalScroll', [position, true], {bubbling: true});
    }

    private _createColumnScrollController(controllerCtor: ListVirtualColumnScrollControllerCtor,
                                          options: ITreeGridControlOptions): void {
        this._listVirtualColumnScrollController = new controllerCtor({
            ...options,
            listControl: this,
            collection: this._listViewModel,
            virtualScrollConfig: options.virtualColumnScrollConfig,
            triggersOffsetCoefficients: {
                backward: options.leftTriggerOffsetCoefficient,
                forward: options.rightTriggerOffsetCoefficient
            },
            triggersPositions: {
                backward: 'offset',
                forward: 'offset'
            },
            triggersVisibility: {
                backward: true,
                forward: true
            },
            doScrollUtil: this._doScrollUtil,
            updatePlaceholdersUtil: (placeholders) => {
                const convertedPlaceholders = {
                    left: placeholders.backward,
                    right: placeholders.forward
                };
                this._notify('updatePlaceholdersSize', [convertedPlaceholders], {bubbling: true});
            }
        });
    }

    _onContentResized(width: number, height: number): void {
        if (this._contentWidth !== width) {
            this._contentWidth = width;
            if (this._listVirtualColumnScrollController) {
                this._updateFixedColumnsWidth();
                this._listVirtualColumnScrollController.contentResized(width);
            }
        }
    }

    private _updateFixedColumnsWidth(options: ITreeGridControlOptions = this._options): void {
        if (!this.__needShowEmptyTemplate(options)) {
            const cellSelector = '.js-controls-Grid__virtualColumnScroll__fake-scrollable-cell-to-recalc-width_fixed';
            this._fixedColumnsWidth = Array.from(this._container.querySelectorAll(cellSelector)).reduce((acc, cell) => {
                return acc + cell.getBoundingClientRect().width;
            }, 0);
        }
    }

    static getDefaultOptions(): Partial<ITreeGridControlOptions> {
        return {
            ...TreeControl.getDefaultOptions(),
            ...GridControl.getDefaultOptions()
        };
    }
}
