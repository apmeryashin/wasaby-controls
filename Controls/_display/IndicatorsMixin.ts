import Indicator, {
    EIndicatorState,
    IOptions as ILoadingIndicatorOptions,
    TIndicatorPosition,
    TIndicatorState
} from './Indicator';
import {TemplateFunction} from 'UI/Base';

export interface ITriggerOffset {
    top: number;
    bottom: number;
}

export default abstract class IndicatorsMixin<T = Indicator> {
    private _indicatorModule: string;

    protected _topIndicator: Indicator = null;
    protected _bottomIndicator: Indicator = null;
    protected _globalIndicator: Indicator = null;

    protected _$portionedSearchTemplate: TemplateFunction|string;
    protected _$continueSearchTemplate: TemplateFunction|string;

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
        let indicator = this._getIndicator(position);
        if (indicator) {
            const changed = indicator.display(state, topOffset);
            if (changed) {
                this._nextVersion();
            }
        } else {
            indicator = this._createIndicator(position, state);
            indicator.display(state, topOffset);
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

    private _createIndicator(position: TIndicatorPosition, state: TIndicatorState): Indicator {
        const indicator = this.createItem({
            itemModule: this._indicatorModule,
            position,
            state,
            // только глобальный индикатор изначально показан, т.к. он при показе - создается, при скрытии - удаляется
            visible: position === 'global',
            portionedSearchTemplate: this._$portionedSearchTemplate,
            continueSearchTemplate: this._$continueSearchTemplate
        }) as unknown as Indicator;

        const indicatorName = this._getIndicatorName(position);
        this[indicatorName] = indicator;
        return indicator;
    }

    abstract createItem(options: ILoadingIndicatorOptions): T;
    protected abstract _nextVersion(): void;
}

Object.assign(IndicatorsMixin.prototype, {
    'Controls/display:IndicatorsMixin': true,
    _indicatorModule: 'Controls/display:Indicator',
    _topIndicator: null,
    _bottomIndicator: null,
    _globalIndicator: null,
    _$portionedSearchTemplate: 'Controls/baseList:LoadingIndicatorTemplate',
    _$continueSearchTemplate: 'Controls/baseList:ContinueSearchTemplate'
});
