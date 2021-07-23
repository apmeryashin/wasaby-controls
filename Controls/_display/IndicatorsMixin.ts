import Indicator, {
    EIndicatorState,
    IOptions as ILoadingIndicatorOptions,
    TIndicatorPosition, TIndicatorState
} from './Indicator';
import LoadingTrigger, {
    TLoadingTriggerPosition,
    IOptions as ILoadingTriggerOptions, DEFAULT_TOP_TRIGGER_OFFSET, DEFAULT_BOTTOM_TRIGGER_OFFSET,
} from './LoadingTrigger';
import {TemplateFunction} from "UI/Base";

export interface ITriggerOffset {
    top: number;
    bottom: number;
}

export default abstract class IndicatorsMixin<T = Indicator|LoadingTrigger> {
    protected _topIndicator: Indicator = null;
    protected _bottomIndicator: Indicator = null;
    protected _globalIndicator: Indicator = null;

    protected _topLoadingTrigger: LoadingTrigger = null;
    protected _bottomLoadingTrigger: LoadingTrigger = null;

    protected _$portionedSearchTemplate: TemplateFunction|string;
    protected _$continueSearchTemplate: TemplateFunction|string;

    // region Indicator

    hasIndicator(position: TIndicatorPosition): boolean {
        return !!this._getIndicator(position);
    }

    getGlobalIndicator(): Indicator {
        return this._globalIndicator;
    }

    getTopIndicator(): Indicator {
        if (!this._topIndicator) {
            // сразу создаем верхний индикатор, он отображается с помощью display: none
            // это сделано только для того, чтобы можно было показывать индикатор при долгой отрисовке
            this._createIndicator('top', EIndicatorState.Loading);
        }
        return this._topIndicator;
    }

    getBottomIndicator(): Indicator {
        if (!this._bottomIndicator) {
            // сразу создаем верхний индикатор, он отображается с помощью display: none
            // это сделано только для того, чтобы можно было показывать индикатор при долгой отрисовке
            this._createIndicator('bottom', EIndicatorState.Loading);
        }
        return this._bottomIndicator;
    }

    displayIndicator(position: TIndicatorPosition, state: TIndicatorState, topOffset?: number): void {
        const indicator = this._getIndicator(position);
        if (indicator) {
            const changed = indicator.display(state, topOffset);
            if (changed) {
                this._nextVersion();
            }
        } else {
            this._createIndicator(position, state);
            this._nextVersion();
        }
    }

    hideIndicator(position: TIndicatorPosition): void {
        const indicator = this._getIndicator(position);
        if (indicator) {
            if (position === 'global') {
                const indicatorName = this._getIndicatorName(position);
                this[indicatorName] = null;
            } else {
                indicator.hide();
            }
            this._nextVersion();
        }
    }

    private _getIndicatorName(position: TIndicatorPosition): string {
        return `_${position}Indicator`;
    }

    private _getIndicator(position: TIndicatorPosition): Indicator {
        const indicatorName = this._getIndicatorName(position);
        return this[indicatorName];
    }

    private _createIndicator(position: TIndicatorPosition, state: TIndicatorState): void {
        const indicator = this.createItem({
            itemModule: 'Controls/display:Indicator',
            position,
            state,
            // только глобальный индикатор изначально показан, т.к. он при показе - создается, при скрытии - удаляется
            visible: position === 'global',
            portionedSearchTemplate: this._$portionedSearchTemplate,
            continueSearchTemplate: this._$continueSearchTemplate
        });

        const indicatorName = this._getIndicatorName(position);
        this[indicatorName] = indicator;
    }

    // endregion Indicator

    // region Trigger

    getTopLoadingTrigger(): LoadingTrigger {
        return this._getLoadingTrigger('top');
    }

    getBottomLoadingTrigger(): LoadingTrigger {
        return this._getLoadingTrigger('bottom');
    }

    displayLoadingTopTrigger(): void {
        const trigger = this._getLoadingTrigger('top');
        const changed = trigger.display();
        if (changed) {
            this._nextVersion();
        }
    }

    hideLoadingTopTrigger(): void {
        const trigger = this._getLoadingTrigger('top');
        const changed = trigger.hide();
        if (changed) {
            this._nextVersion();
        }
    }

    setLoadingTriggerOffset(offset: ITriggerOffset): void {
        let changed = false;
        if (this._topLoadingTrigger) {
            const topOffsetChanged = this._topLoadingTrigger.setOffset(offset.top);
            changed = changed || topOffsetChanged;
        }
        if (this._bottomLoadingTrigger) {
            const bottomOffsetChanged = this._bottomLoadingTrigger.setOffset(offset.bottom);
            changed = changed || bottomOffsetChanged;
        }
        if (changed) {
            this._nextVersion();
        }
    }

    private _getLoadingTriggerName(position: TLoadingTriggerPosition): string {
        return `_${position}LoadingTrigger`;
    }

    private _getLoadingTrigger(position: TLoadingTriggerPosition): LoadingTrigger {
        const triggerName = this._getLoadingTriggerName(position);

        let trigger = this[triggerName];

        if (!trigger) {
            this._createLoadingTrigger(position);
        }
        return this[triggerName];
    }

    private _createLoadingTrigger(position: TLoadingTriggerPosition): void {
        const isTopTrigger = position === 'top';
        const visible = !isTopTrigger;

        let offset = 0;
        if (isTopTrigger && this.getTopIndicator().isDisplayed()) {
            offset = DEFAULT_TOP_TRIGGER_OFFSET;
        } else if (this.getBottomIndicator().isDisplayed()) {
            offset = DEFAULT_BOTTOM_TRIGGER_OFFSET;
        }

        const trigger = this.createItem({
            itemModule: 'Controls/display:LoadingTrigger',
            position,
            offset,
            visible
        });

        const triggerName = this._getLoadingTriggerName(position);
        this[triggerName] = trigger;
    }

    // endregion Trigger

    abstract createItem(options: ILoadingIndicatorOptions|ILoadingTriggerOptions): T;
    protected abstract _nextVersion(): void;
}

Object.assign(IndicatorsMixin.prototype, {
    'Controls/display:IndicatorsMixin': true,
    _topIndicator: null,
    _bottomIndicator: null,
    _globalIndicator: null,
    _topTrigger: null,
    _bottomTrigger: null,
    _$portionedSearchTemplate: 'Controls/baseList:LoadingIndicatorTemplate',
    _$continueSearchTemplate: 'Controls/baseList:ContinueSearchTemplate'
});