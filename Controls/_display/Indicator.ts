import CollectionItem, { IOptions as ICollectionOptions} from './CollectionItem';
import { TemplateFunction } from 'UI/Base';
import {Model} from 'Types/entity';
import {isEqual} from 'Types/object';

export type TIndicatorPosition = 'top'|'bottom'|'global';
export type TIndicatorState = 'portioned-search'|'continue-search'|'loading';
export enum EIndicatorState {
    PortionedSearch= 'portioned-search',
    ContinueSearch= 'continue-search',
    Loading= 'loading'
}

export interface IOptions extends ICollectionOptions<null> {
    position: TIndicatorPosition;
    state: TIndicatorState;
    visible: boolean;
    portionedSearchTemplate: TemplateFunction|string;
    continueSearchTemplate: TemplateFunction|string;
}

export default class Indicator extends CollectionItem<null> {
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    protected _$position: TIndicatorPosition;
    protected _$state: TIndicatorState;
    protected _$visible: boolean;
    /**
     * Вертикальная позиция глобального индикатора
     * @protected
     */
    protected _topOffset: number = 0;

    protected _$portionedSearchTemplate: TemplateFunction|string;
    protected _$continueSearchTemplate: TemplateFunction|string;
    private _metaData: { results?: Model };

    get key(): string {
        return `${this._$state}-` + this._$position + this._instancePrefix;
    }

    display(state: TIndicatorState, topOffset?: number): boolean {
        const isHidden = !this._$visible;
        if (isHidden) {
            this._$visible = true;
            this._nextVersion();
        }

        const stateChanged = this._$state !== state;
        if (stateChanged) {
            this._$state = state;
            this._nextVersion();
        }

        if (topOffset !== undefined && this._topOffset !== topOffset) {
            this._topOffset = topOffset;
        }

        return isHidden || stateChanged;
    }

    hide(): boolean {
        const isVisible = this._$visible;
        if (isVisible) {
            this._$visible = false;
            this._nextVersion();
        }
        return isVisible;
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        return 'Controls/baseList:IndicatorTemplate';
    }

    getContentTemplate(): TemplateFunction|string|void {
        switch (this._$state) {
            case 'loading':
                return 'Controls/baseList:LoadingIndicatorItemTemplate';
            case 'portioned-search':
                return this._$portionedSearchTemplate;
            case 'continue-search':
                return this._$continueSearchTemplate;
        }
    }

    getClasses(): string {
        let classes = '';

        switch (this._$state) {
            case 'loading':
                classes += ' controls-BaseControl__loadingIndicator';
                classes += ` controls-BaseControl__loadingIndicator__state-${this._$position}`;
                break;
            case 'portioned-search':
                classes += ' controls-BaseControl__loadingIndicator controls-BaseControl__portionedSearch';
                classes += ` controls-BaseControl__portionedSearch__state-${this._$position}`;
                break;
            case 'continue-search':
                classes += ' controls-BaseControl__continueSearch ws-justify-content-center';
                break;
        }

        return classes;
    }

    getStyles(): string {
        let styles = '';

        if (!this._$visible) {
            styles += ' display: none;';
        }

        if (this.isGlobalIndicator()) {
            styles += ` top: ${this._topOffset}px;`;
        }

        return styles;
    }

    isTopIndicator(): boolean {
        return this._$position === 'top';
    }

    isBottomIndicator(): boolean {
        return this._$position === 'bottom';
    }

    isGlobalIndicator(): boolean {
        return this._$position === 'global';
    }

    getQAData(templateQAData?: string): string {
        return this.key;
    }

    isDisplayed(): boolean {
        return this._$visible;
    }

    /**
     * Перерисовывает индикатор.
     * В темплейтах Порционного поиска и Продолжить поиск, могут задать footerTemplate, в котором выводят доп информацию.
     * Обычно это используют для отрисовки кол-ва уже просмотренных данных, которые лежат в метаДанных.
     * Поэтому нам нужно перерисоваться при изменении метаДанных.
     * @return {boolean} Возвращает изменилось ли значение, чтобы при необходимости поднять версию модели
     */
    setMetaData(metaData: { results?: Model }): boolean {
        let changed = false;
        if (this.isDisplayed() && (this._$state === 'portioned-search' || this._$state === 'continue-search')) {
            if (!isEqual(this._metaData, metaData)) {
                this._metaData = metaData;
                this._nextVersion();
                changed = true;
            }
        }
        return changed;
    }
}

Object.assign(Indicator.prototype, {
    'Controls/display:Indicator': true,
    _moduleName: 'Controls/display:Indicator',
    _instancePrefix: '-indicator',
    _$position: null,
    _$state: null,
    _$visible: false,
    _$portionedSearchTemplate: 'Controls/baseList:LoadingIndicatorTemplate',
    _$continueSearchTemplate: 'Controls/baseList:ContinueSearchTemplate'
});
