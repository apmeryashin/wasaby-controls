import {BaseControl, IBaseControlOptions} from 'Controls/baseList';
import type {TColumns, THeader} from 'Controls/grid';
import {Controller as ListVirtualColumnScrollController} from 'Controls/horizontalScroll';

const HORIZONTAL_LOADING_TRIGGER_SELECTOR = '.controls-BaseControl__loadingTrigger_horizontal';
const DEFAULT_TRIGGER_OFFSET = 0.3;

export interface IGridControlMixinOptions extends IBaseControlOptions {
    _newColumnScroll?: boolean;

    columns: TColumns;
    header?: THeader;
    stickyColumnsCount?: number;
    columnScrollStartPosition?: 'end';

    // FIX: тип должен импортироваться
    virtualColumnScrollConfig?: {
        pageSize?: number;
    };

    leftTriggerOffsetCoefficient?: number;
    rightTriggerOffsetCoefficient?: number;
}

export class GridControlMixin<
    TControl extends BaseControl<IGridControlMixinOptions> = BaseControl<IGridControlMixinOptions>
    > {
    private _listVirtualColumnScrollController: ListVirtualColumnScrollController;

    _$prepareItemsOnMount(options: IGridControlMixinOptions): void {
        if (!!options._newColumnScroll && options.virtualColumnScrollConfig) {
            this._createColumnScrollController(options);
        }
    }

    _$afterMount(): void {
        if (this._listVirtualColumnScrollController) {
            this._listVirtualColumnScrollController.setItemsContainer(this._getItemsContainer());
            this._listVirtualColumnScrollController.setListContainer(this._container);
        }
    }

    _$viewportResizeHandler(viewportHeight: number, viewportRect: DOMRect, scrollTop: number): void {
        if (this._listVirtualColumnScrollController) {
            this._listVirtualColumnScrollController.viewportResized(viewportRect.width);
        }
    }

    _$beforeRender(): void {
        if (this._listVirtualColumnScrollController) {
            const hasNotRenderedChanges = this._hasItemWithImageChanged ||
                this._indicatorsController.hasNotRenderedChanges();
            this._listVirtualColumnScrollController.beforeRenderListControl(hasNotRenderedChanges);
        }
    }

    _$afterRender(): void {
        if (this._listVirtualColumnScrollController) {
            this._listVirtualColumnScrollController.afterRenderListControl();
        }
    }

    _$observeScrollHandler(eventName, params): void {
        if (!this._listVirtualColumnScrollController) {
            return;
        }
        switch (eventName) {
            case 'horizontalScrollMoveSync':
                this._listVirtualColumnScrollController.scrollPositionChange(params.scrollLeft);
                break;
        }
    }

    private _createColumnScrollController(options: IGridControlMixinOptions): void {
        this._listVirtualColumnScrollController = new ListVirtualColumnScrollController({
            listControl: this,
            collection: this._listViewModel,
            virtualScrollConfig: options.virtualColumnScrollConfig,
            columns: options.columns,
            header: options.header,
            stickyColumnsCount: options.stickyColumnsCount,
            columnScrollStartPosition: options.columnScrollStartPosition,
            triggersQuerySelector: HORIZONTAL_LOADING_TRIGGER_SELECTOR,
            backwardTriggerOffsetCoefficient: options.leftTriggerOffsetCoefficient,
            forwardTriggerOffsetCoefficient: options.rightTriggerOffsetCoefficient,
            itemsQuerySelector: '.js-controls-Grid__columnScroll__relativeCell',
            triggersVisibility: {
                backward: true,
                forward: true
            },
            doScrollUtil: (position) => {
                // this._notify('doHorizontalScroll', [scrollTop, true], { bubbling: true });
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

    _$onColumnScroll(e, position: number): void {
        if (this._listVirtualColumnScrollController) {
            this._listVirtualColumnScrollController.scrollPositionChange(position);
        }
    }

    static getDefaultOptions(): Partial<IGridControlMixinOptions> {
        return {
            leftTriggerOffsetCoefficient: DEFAULT_TRIGGER_OFFSET,
            rightTriggerOffsetCoefficient: DEFAULT_TRIGGER_OFFSET
        };
    }
}
