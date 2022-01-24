import {BaseControl, IBaseControlOptions, IScrollParams} from 'Controls/baseList';
import {TColumns} from 'Controls/_grid/display/interface/IColumn';
import {THeader} from 'Controls/_grid/display/interface/IHeaderCell';
import type {
    Controller as ListVirtualColumnScrollController,
    IControllerOptions as IListVirtualColumnScrollControllerOptions
} from 'Controls/horizontalScroll';
import {SyntheticEvent} from 'UI/Vdom';

type ListVirtualColumnScrollControllerCtor =
    new (options: IListVirtualColumnScrollControllerOptions) => ListVirtualColumnScrollController;

export const DEFAULT_TRIGGER_OFFSET = 0.3;

export interface IGridControlOptions extends IBaseControlOptions {
    newColumnScroll?: boolean;

    columns: TColumns;
    header?: THeader;
    stickyColumnsCount?: number;
    columnScrollStartPosition?: 'end';

    virtualColumnScrollConfig?: {
        pageSize?: number;
    };

    leftTriggerOffsetCoefficient?: number;
    rightTriggerOffsetCoefficient?: number;
}

export class GridControl extends BaseControl<IGridControlOptions> {
    private _listVirtualColumnScrollController?: ListVirtualColumnScrollController;
    private _listVirtualColumnScrollScope?: object;

    protected constructor(...args: unknown[]) {
        super(...args);
        this._columnScrollThumbPositionChangedCallback = this._columnScrollThumbPositionChangedCallback.bind(this);
    }

    protected _prepareItemsOnMount(self: this, newOptions: IGridControlOptions): Promise<unknown> {
        super._prepareItemsOnMount(self, newOptions);
        this._listVirtualColumnScrollScope = this._getListVirtualColumnScrollScope(newOptions);
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

    protected _afterMount(...args: [IGridControlOptions]): void {
        super._afterMount(...args);
        if (this._listVirtualColumnScrollController) {
            this._listVirtualColumnScrollScope = this._getListVirtualColumnScrollScope(args[0]);
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
        if (!this._listVirtualColumnScrollController) {
            return;
        }
        const [, eventName, params] = args;
        switch (eventName) {
            case 'horizontalScrollMoveSync':
                this._listVirtualColumnScrollController.scrollPositionChange(params.scrollLeft);
                break;
        }
    }

    viewportResizeHandler(viewportHeight: number, viewportRect: DOMRect, scrollTop: number): void {
        super.viewportResizeHandler(viewportHeight, viewportRect, scrollTop);
        if (this._listVirtualColumnScrollController) {
            this._listVirtualColumnScrollController.viewportResized(viewportRect.width);
            this._listVirtualColumnScrollScope = this._getListVirtualColumnScrollScope(this._options);
        }
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

    private _createColumnScrollController(controllerCtor: ListVirtualColumnScrollControllerCtor,
                                          options: IGridControlOptions): void {
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
            scrollPositionChangeCallback: this._scrollPositionChangeCallback.bind(this),
            doScrollUtil: (position) => {
                this._notify('doHorizontalScroll', [position, true], {bubbling: true});
            },
            updatePlaceholdersUtil: (placeholders) => {
                const convertedPlaceholders = {
                    left: placeholders.backward,
                    right: placeholders.forward
                };
                this._notify('updatePlaceholdersSize', [convertedPlaceholders], {bubbling: true});
            }
        });
    }

    _getListVirtualColumnScrollScope(options: IGridControlOptions): object {
        if (!this._listVirtualColumnScrollController) {
            return {};
        }

        return {
            columnScrollPositionChangedCallback: this._columnScrollThumbPositionChangedCallback,
            viewportSize: this._listVirtualColumnScrollController._scrollController._viewportSize,
            contentSize: this._listVirtualColumnScrollController._scrollController._contentSize,
            fixedWidth: 300,
            scrollableWidth: this._listVirtualColumnScrollController._scrollController._viewportSize - 300,
            stickyColumnsCount: options.stickyColumnsCount || 1,
            columnsLength: this._listViewModel.getColumnsEnumerator().getColumns().length
        };
    }

    _columnScrollThumbPositionChangedCallback(position: number): void {
        this._notify('doHorizontalScroll', [position, true], {bubbling: true});
    }

    _scrollPositionChangeCallback(position: number): void {
        this._children.listView._children.horizontalScrollBar.setScrollPosition(position);
    }

    _onContentResized(width: number, height: number): void {
        if (this._listVirtualColumnScrollController) {
            this._listVirtualColumnScrollController.contentResized(width);
            this._listVirtualColumnScrollScope = this._getListVirtualColumnScrollScope(this._options);
        }
    }

    static getDefaultOptions(): Partial<IGridControlOptions> {
        return {
            ...BaseControl.getDefaultOptions(),
            leftTriggerOffsetCoefficient: DEFAULT_TRIGGER_OFFSET,
            rightTriggerOffsetCoefficient: DEFAULT_TRIGGER_OFFSET
        };
    }
}
