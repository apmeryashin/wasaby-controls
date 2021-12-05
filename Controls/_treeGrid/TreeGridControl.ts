import {IScrollParams} from 'Controls/baseList';
import {TreeControl, ITreeControlOptions} from 'Controls/tree';
import {GridControl, IGridControlOptions} from 'Controls/grid';
import {Controller as ListVirtualColumnScrollController} from 'Controls/horizontalScroll';
import {SyntheticEvent} from 'UI/Vdom';

export interface ITreeGridControlOptions extends ITreeControlOptions, IGridControlOptions {}

export class TreeGridControl extends TreeControl<ITreeGridControlOptions> {
    private _listVirtualColumnScrollController?: ListVirtualColumnScrollController;

    protected _prepareItemsOnMount(self: this, newOptions: ITreeGridControlOptions): void {
        super._prepareItemsOnMount(self, newOptions);
        if (newOptions.newColumnScroll && newOptions.virtualColumnScrollConfig) {
            this._createColumnScrollController(newOptions);
        }
    }

    protected _afterMount(...args): void {
        super._afterMount(...args);
        this._listVirtualColumnScrollController?.setItemsContainer(this._getItemsContainer());
        this._listVirtualColumnScrollController?.setListContainer(this._container);
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

    private _createColumnScrollController(options: IGridControlOptions): void {
        this._listVirtualColumnScrollController = new ListVirtualColumnScrollController({
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

    _onContentResized(width: number, height: number): void {
        this._listVirtualColumnScrollController?.contentResized(width);
    }

    static getDefaultOptions(): Partial<ITreeGridControlOptions> {
        return {
            ...TreeControl.getDefaultOptions(),
            ...GridControl.getDefaultOptions()
        };
    }
}
