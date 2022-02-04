import {Control, IControlOptions} from 'UI/Base';
import {DependencyTimer, StickyOpener} from 'Controls/popup';
import {Logger} from 'UI/Utils';
import LinkView from './LinkView';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import {IFontSizeOptions} from 'Controls/interface';
import {IDatePopupTypeOptions} from 'Controls/_date/interface/IDatePopupType';
import {IDateConstructorOptions} from 'Controls/interface';
import IValueOptions from 'Controls/_date/interface/IValue';
import {SyntheticEvent} from 'Vdom/Vdom';
import {constants} from 'Env/Env';

export interface IBaseSelectorOptions extends IControlOptions, IFontSizeOptions, IDatePopupTypeOptions,
    IDateConstructorOptions, IValueOptions {
}

export default class BaseSelector<T extends IBaseSelectorOptions> extends Control<T> {
    protected _dependenciesTimer: DependencyTimer = null;
    protected _loadCalendarPopupPromise: Promise<unknown> = null;
    protected _state: string;

    private _stickyOpener: StickyOpener;
    protected _children: {
        linkView: LinkView<T>;
    };

    protected _beforeMount(options: IBaseSelectorOptions): void {
        this._stateChangedCallback = this._stateChangedCallback.bind(this);
        this.shiftPeriod = this.shiftPeriod.bind(this);

        this._stickyOpener = new StickyOpener({closeOnOutsideClick: true, actionOnScroll: 'close'});
    }

    protected _onResult(value: Date): void {
        if (value instanceof Date || !value) {
            this.closePopup();
            this._notifyValueChanged(value);
        }
    }

    shiftPeriod(delta: number): void {
        this._children.linkView.shiftPeriod(delta);
    }

    shiftBack(): void {
        this._children.linkView.shiftBack();
    }

    shiftForward(): void {
        this._children.linkView.shiftForward();
    }

    protected _stateChangedCallback(state: string): void {
        this._state = state;
    }

    protected _notifyValueChanged(value: Date): void {
        this._notify('valueChanged', [value]);
    }

    closePopup(): void {
        this._stickyOpener.close();
    }

    openPopup(): void {
        this._stickyOpener.open(this._getPopupOptions());
    }

    protected _getPopupOptions(): IStickyPopupOptions {
        return {};
    }

    protected _getFontSizeClass(): string {
        // c fontSize 18px (20px, 24px и тд) линк смещается на 1px вниз, с 14px (13px, 12px и тд) на 1px вверх
        // относительно стандратного положения
        switch (this._options.fontSize) {
            case '4xl': return 'l';
            case '3xl': return 'l';
            case 'm': return 's';
            case 's': return 's';
            case 'xs': return 's';
            default: return 'm';
        }
    }

    protected _startDependenciesTimer(module: string, loadCss: Function): void {
        if (!this._options.readOnly) {
            if (!this._dependenciesTimer) {
                this._dependenciesTimer = new DependencyTimer();
            }
            this._dependenciesTimer.start(this._loadDependencies.bind(this, module, loadCss));
        }
    }

    protected _mouseEnterHandler(): void {
        if (this._options.datePopupType !== 'datePicker') {
            let libName;
            switch (this._options.datePopupType) {
                case 'shortDatePicker':
                    libName = 'Controls/shortDatePicker';
                    break;
                case 'compactDatePicker':
                    libName = 'Controls/compactDatePicker';
                    break;
            }
            const loadCss = ({View}) => View.loadCSS();
            this._startDependenciesTimer(libName, loadCss);
        } else {
            const loadCss = (datePopup) => datePopup.default.loadCSS();
            this._startDependenciesTimer('Controls/datePopup', loadCss);
        }
    }

    protected _mouseLeaveHandler(): void {
        this._dependenciesTimer?.stop();
    }

    protected _loadDependencies(module: string, loadCss: Function): Promise<unknown> {
        try {
            if (!this._loadCalendarPopupPromise) {
                this._loadCalendarPopupPromise = import(module)
                    .then(loadCss);
            }
            return this._loadCalendarPopupPromise;
        } catch (e) {
            Logger.error(module, e);
        }
    }

    protected _keyDownHandler(event: SyntheticEvent<KeyboardEvent>): void {
        if (event.nativeEvent.keyCode === constants.key.space) {
            this.openPopup();
        }
    }
}
