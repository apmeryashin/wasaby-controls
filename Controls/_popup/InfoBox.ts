import {Control, TemplateFunction} from 'UI/Base';
import InfoBoxOpener from 'Controls/_popup/Opener/InfoBox';
import {IInfoBox, IInfoBoxOptions} from 'Controls/_popup/interface/IInfoBox';
import {IInfoBoxPopupOptions} from 'Controls/_popup/interface/IInfoBoxOpener';
import { TouchDetect } from 'Env/Touch';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor} from 'Types/entity';
import {goUpByControlTree} from 'UI/Focus';
import * as getZIndex from 'Controls/Utils/getZIndex';
import template = require('wml!Controls/_popup/InfoBox/InfoBox');
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {CalmTimer} from 'Controls/_popup/utils/FastOpen';
import {detection} from 'Env/Env';
import {Logger} from 'UI/Utils';

/**
 * Контрол, отображающий всплывающую подсказку относительно указанного элемента.
 * Всплывающую подсказку вызывает событие, указанное в опции trigger.
 * В один момент времени на странице может отображаться только одна всплывающая подсказка.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FInfoBox%2FOpener%2FInfoBox демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/infobox/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @mixes Controls/popup:IInfoBox
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/InfoBox/InfoBox
 */
class InfoboxTarget extends Control<IInfoBoxOptions> implements IInfoBox {
    readonly '[Controls/_popup/interface/IInfoBox]': boolean;

    _template: TemplateFunction = template;
    _isNewEnvironment: Function = isNewEnvironment;
    _opened: boolean;
    _children: {
        infoBoxOpener: InfoBoxOpener
    };
    private _openCalmTimer: CalmTimer;
    private _closeCalmTimer: CalmTimer;

    protected _beforeMount(options: IInfoBoxOptions): void {
        this._resultHandler = this._resultHandler.bind(this);
        this._closeHandler = this._closeHandler.bind(this);
        this._openCalmTimer = new CalmTimer(() => {
            if (!this._opened && !TouchDetect.getInstance().isTouch()) {
                this._startOpeningPopup();
            }
        });
        this._closeCalmTimer = new CalmTimer(() => {
            this.close();
            this._forceUpdate();
        });
        if (options.style !== undefined) {
            Logger.warn(`${this._moduleName}: Используется устаревшая опция style,` +
                                                                               ' нужно использовать borderStyle', this);
        }
    }

    protected _beforeUnmount(): void {
        if (this._opened) {
            this.close();
        }
        this._openCalmTimer.stop();
        this._closeCalmTimer.stop();
    }

    open(): void {
        const config: IInfoBoxPopupOptions = this._getConfig();

        if (this._isNewEnvironment()) {
            this._notify('openInfoBox', [config, false], {bubbling: true});
        } else {
            // To place zIndex in the old environment
            config.zIndex = getZIndex(this._children.infoBoxOpener);
            this._children.infoBoxOpener.open(config);
        }

        this._openCalmTimer.stop();
        this._closeCalmTimer.stop();
        this._opened = true;
        this._forceUpdate();
    }

    private _getConfig(): IInfoBoxPopupOptions {
        const closeOnOutsideClick = this._options.trigger === 'click' || this._options.trigger === 'demand' ||
            this._options.trigger === 'hover|touch' && detection.isMobilePlatform;
        return {
            opener: this,
            target: this._container,
            template: this._options.template,
            position: this._options.position,
            targetSide: this._options.targetSide,
            alignment: this._options.alignment,
            borderStyle: this._options.style || this._options.borderStyle,
            validationStatus: 'valid',
            horizontalPadding: this._options.horizontalPadding,
            // InfoBox close by outside click only if trigger is set to 'demand' or 'click'.
            closeOnOutsideClick,
            floatCloseButton: this._options.floatCloseButton,
            closeButtonVisible: this._options.closeButtonVisibility !== undefined ?
                                                this._options.closeButtonVisibility : this._options.closeButtonVisible ,
            eventHandlers: {
                onResult: this._resultHandler,
                onClose: this._closeHandler
            },
            templateOptions: this._options.templateOptions
        };
    }

    close(withDelay: boolean = true): void {
        if (this._isNewEnvironment()) {
            this._notify('closeInfoBox', [!!withDelay], {bubbling: true});
        } else {
            if (!this._destroyed) {
                this._children.infoBoxOpener.close();
            }
        }
        this._openCalmTimer.stop();
        this._opened = false;
    }

    private _startOpeningPopup(): void {
        this.open();
        this._forceUpdate();
    }

    protected _contentMousedownHandler(event: SyntheticEvent<MouseEvent>): void {
        if (this._options.trigger === 'click') {
            if (!this._opened) {
                this.open();
            }
            event.stopPropagation();
        }
    }

    protected _contentMousemoveHandler(): void {
        if (this._options.trigger === 'hover' || this._options.trigger === 'hover|touch') {
            this._openCalmTimer.start();
        }
    }

    protected _contentTouchStartHandler(event: Event): void {
        if (this._options.trigger === 'hover|touch') {
            this._startOpeningPopup();
            const {target} = event;
            const isInput = target?.tagName === 'INPUT';
            const isTextArea = target?.tagName === 'TEXTAREA';
            const isContentEditable = target?.getAttribute('contenteditable') === 'true';

            // Если тачнули в поле ввода, то не останавливаем событие, иначе не покажется клавиатура
            const needPrevent = !isInput && !isTextArea && !isContentEditable;
            if (needPrevent) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    protected _contentClickHandler(event: Event): void {
        // Остановка события тача не остановит событие клика.
        // Будем останавливать сами событие клика в случае если инфобокс:
        // 1. Открывается по клику
        // 2. Открывается по тачу. Делаем проверку на isMobilePlatform, т.к. иначе мы бы так же останавливали событие
        // по ховеру на десктопе.
        if ((this._options.trigger === 'hover|touch' && detection.isMobilePlatform) ||
            this._options.trigger === 'click') {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    protected _contentMouseleaveHandler(): void {
        if (this._options.trigger === 'hover' || this._options.trigger === 'hover|touch') {
            this._openCalmTimer.stop();
            this._mouseLeaveHandler();
        }
    }

    private _mouseLeaveHandler(relatedTarget?: EventTarget, infoboxTemplate?: Control): void {
        const upTree = relatedTarget ? goUpByControlTree(relatedTarget) : [];
        if (!relatedTarget || !upTree.includes(infoboxTemplate)) {
            this._closeCalmTimer.start(300);
        }
    }

    private _resultHandler(event: SyntheticEvent<MouseEvent>, infoboxTemplate: Control): void {
        switch (event.type) {
            case 'mouseenter':
                this._openCalmTimer.stop();
                this._closeCalmTimer.stop();
                break;
            case 'mouseleave':
                if (this._options.trigger === 'hover' || this._options.trigger === 'hover|touch') {
                    this._openCalmTimer.stop();
                    const {relatedTarget} = event.nativeEvent;
                    this._mouseLeaveHandler(relatedTarget, infoboxTemplate);
                }
                break;
            case 'mousedown':
                event.stopPropagation();
                break;
            case 'close':
                // todo Для совместимости. Удалить, как будет сделана задача
                // https://online.sbis.ru/opendoc.html?guid=dedf534a-3498-4b93-b09c-0f36f7c91ab5
                this._opened = false;
        }
    }

    private _closeHandler(): void {
        this._opened = false;
    }

    protected _scrollHandler(): void {
        this.close(false);
    }

    static getOptionTypes(): Record<string, Function> {
        return {
            trigger: descriptor(String).oneOf([
                'hover',
                'click',
                'hover|touch',
                'demand'
            ])
        };
    }

    static getDefaultOptions(): IInfoBoxOptions {
        return {
            targetSide: 'top',
            alignment: 'start',
            borderStyle: 'secondary',
            trigger: 'hover',
            closeButtonVisible: true
        };
    }
}

Object.defineProperty(InfoboxTarget, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return InfoboxTarget.getDefaultOptions();
    }
});

export default InfoboxTarget;
