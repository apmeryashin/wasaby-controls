import {IControlOptions} from 'UI/Base';

export interface IInfoBoxOptions extends IControlOptions {
    /**
     * @name Controls/_popup/interface/IInfoBox#targetSide
     * @cfg {String} Сторона таргета, относительно которой будет позиционнироваться всплывающая подсказка.
     * @variant top Подсказка позиционируется сверху от таргета
     * @variant bottom Подсказка позиционируется снизу от таргета
     * @variant left Подсказка позиционируется слева от таргета
     * @variant right Подсказка позиционируется справа от таргета
     * @default top
     */

    /*
    * @name Controls/_popup/interface/IInfoBox#targetSide
    * @cfg {String} Side positioning of the target relative to infobox.
    * Popup displayed on the top of the target.
    * @variant top Popup displayed on the top of the target.
    * @variant bottom Popup displayed on the bottom of the target.
    * @variant left Popup displayed on the left of the target.
    * @variant right Popup displayed on the right of the target.
    * @default top
    */
    targetSide?: string;
    position?: string; // old option.
    /**
     * @name Controls/_popup/interface/IInfoBox#alignment
     * @cfg {String} Выравнивание всплывающей подсказки относительно вызывающего её элемента.
     * @variant start Подсказка выравнивается от начала главной оси.
     * @variant center Подсказка выравнивается по центру главной оси.
     * @variant end Подсказка выравнивается от конца главной оси.
     * @default start
     */

    /*
    * @name Controls/_popup/interface/IInfoBox#alignment
    * @cfg {String} Alignment of the infobox relative to target
    * Popup aligned by start of the target.
    * @variant start Popup aligned by start of the target.
    * @variant center Popup aligned by center of the target.
    * @variant end Popup aligned by end of the target.
    * @default start
    */
    alignment?: string;
    /**
     * @name Controls/_popup/interface/IInfoBox#borderStyle
     * @cfg {String} Внешний вид всплывающей подсказки.
     * @variant default
     * @variant danger
     * @variant warning
     * @variant info
     * @variant secondary
     * @variant success
     * @variant primary
     * @default secondary
     */

    /*
    * @name Controls/_popup/interface/IInfoBox#borderStyle
    * @cfg {String} Infobox display style.
    * @variant default
    * @variant danger
    * @variant warning
    * @variant info
    * @variant secondary
    * @variant success
    * @variant primary
    */
    borderStyle?: string;
    /**
     * @name Controls/_popup/interface/IInfoBox#trigger
     * @cfg {String} Определяет, какое событие будет иницировать открытие и закрытие всплывающей подсказки.
     * @variant click Открывается по клику на контент. Закрывается по клику вне контента или шаблона.
     * @variant hover Открывается по наведению мыши на контент. Закрывается по уходу мыши с шаблона и контента. Открытие игнорируется на тач - устройствах.
     * @variant hover|touch Открывается по наведению или по тачу на контент. Закрывается по уходу мыши с контента или с шаблона, а также по тачу вне контента или шаблона.
     * @variant demand  Разработчик октрывает и закрывает всплывающее окно вручную. Также подсказка закроется по клику вне шаблона или контента.
     * @default hover
     */

    /*
    * @name Controls/_popup/interface/IInfoBox#trigger
    * @cfg {String} Event name trigger the opening or closing of the template.
    * @variant click Opening by click on the content. Closing by click not on the content or template.
    * @variant hover Opening by hover on the content. Closing by hover not on the content or template.
    * Opening is ignored on touch devices.
    * @variant hover|touch Opening by hover or touch on the content. Closing by hover not on the content or template.
    * @variant demand  Developer opens and closes InfoBox manually. Also it will be closed by click not on the content or template.
    * @default hover
    */
    trigger?: string;
    /**
     * @name Controls/_popup/interface/IInfoBox#floatCloseButton
     * @cfg {Boolean} Определяет, будет ли контент обтекать кнопку закрытия.
     * @default false
     */

    /*
    * @name Controls/_popup/interface/IInfoBox#floatCloseButton
    * @cfg {Boolean} Whether the content should wrap around the cross closure.
    * @default false
    */
    floatCloseButton?: boolean;
    /**
     * @name Controls/_popup/interface/IInfoBox#template
     * @cfg {function|String} Шаблон всплывающей подсказки
     * @example
     * При передаче в опцию шаблона необходимо обеспечить его минимальной версткой и как минимум
     * обернуть в корневой div.
     * <pre>
     *     <Controls.popup:InfoboxTarget trigger="hover">
     *                <ws:content>
     *                    ...
     *                </ws:content>
     *                <ws:template>
     *                   <div>Это всплывающая подсказка по ховеру.</div>
     *                </ws:template>
     *             </Controls.popup:InfoboxTarget>
     * </pre>
     */

    /*
    * @name Controls/_popup/interface/IInfoBox#template
    * @cfg {function|String} Popup template.
    */
    template?: string;
    /**
     * @name Controls/_popup/interface/IInfoBox#templateOptions
     * @cfg {Object} Опции для контрола, переданного в {@link template}
     */

    /*
    * @name Controls/_popup/interface/IInfoBox#templateOptions
    * @cfg {Object} Popup template options.
    */
    templateOptions?: any;
    /**
     * @name Controls/_popup/interface/IInfoBox#closeButtonVisible
     * @cfg {Boolean} Определяет, будет ли отображаться кнопка закрытия.
     * @default true
     */

    /*
    * @name Controls/_popup/interface/IInfoBox#closeButtonVisible
    * @cfg {Boolean} Whether the close button is displayed.
    * @default true
    */
    closeButtonVisible?: boolean;

    /**
     * @name Controls/_popup/interface/IInfoBox#horizontalPadding
     * @cfg {Boolean} Задает отступ контента по горизонтали
     * @default m
     */

    /*
    * @name Controls/_popup/interface/IInfoBox#closeButtonVisible
    * @cfg {Boolean} Whether the close button is displayed.
    * @default true
    */
    horizontalPadding?: 'm' | 'null';
}

/**
 * Интерфейс для опций {@link Controls/popup:InfoboxTarget всплывающих подсказок}.
 * @public
 * @author Красильников А.С.
 */
export interface IInfoBox {
    readonly '[Controls/_popup/interface/IInfoBox]': boolean;
}

/**
 * Метод открытия всплывающей подсказки.
 * @function Controls/_popup/interface/IInfoBox#open
 * @param {PopupOptions} popupOptions Опции всплывающей подсказки.
 * @see close
 */

/*
 * Open InfoBox
 * @function Controls/_popup/interface/IInfoBox#open
 * @param {PopupOptions} popupOptions InfoBox popup options.
 */

/**
 * @typedef {Object} PopupOptions
 * @description Конфигурация всплывающей подсказки.
 * @property {function|String} template Шаблон всплывающей подсказки
 * @property {Object} templateOptions Опции для контрола, переданного в {@link Controls/_popup/interface/IInfoBox#template template}.
 * @property {String} trigger Определяет, какое событие будет иницировать открытие и закрытие всплывающей подсказки.
 * @property {String} targetSide Сторона таргета, относительно которой будет позиционнироваться всплывающая подсказка.
 * @property {String} alignment Выравнивание всплывающей подсказки относительно вызывающего её элемента.
 * @property {Boolean} floatCloseButton  Определяет, будет ли контент обтекать кнопку закрытия.
 * @property {Boolean} closeButtonVisible Определяет, будет ли отображаться кнопка закрытия.
 * @property {String} style Внешний вид всплывающей подсказки.
 */

/*
 * @typedef {Object} PopupOptions
 * @description InfoBox configuration.
 * @property {function|String} content The content to which the logic of opening and closing the template is added.
 * @property {function|String} template Template inside popup
 * @property {Object} templateOptions Template options inside popup.
 * @property {String} trigger Event name trigger the opening or closing of the template.
 * @property {String} targetSide
 * @property {String} alignment
 * @property {Boolean} floatCloseButton Whether the content should wrap around the cross closure.
 * @property {Boolean} closeButtonVisible Whether the close button is displayed.
 * @property {String} style InfoBox display style.
 */

/**
 * Метод закрытия всплывающей подсказки
 * @function Controls/_popup/interface/IInfoBox#close
 * @see open
 */

/*
 * Сlose InfoBox
 * @function Controls/_popup/interface/IInfoBox#close
 */

/**
 * @name Controls/_popup/interface/IInfoBox#content
 * @cfg {function|String} Элемент управления, к которому добавляется логика открытия и закрытия всплывающей подсказки.
 */

/*
 * @name Controls/_popup/interface/IInfoBox#content
 * @cfg {function|String} The content to which the logic of opening and closing the template is added.
 */

/**
 * @event Происходит при открытии всплывающей подсказки.
 * @name Controls/_popup/interface/IInfoBox#openInfoBox
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object} config Конфигурация всплывающей подсказки.
 * @remark
 * Если из кода {@link /doc/platform/developmentapl/interface-development/ui-library/events/#event-notify опубликовать событие}, то будет открыта всплывающая подсказка с конфигурацией, которая указана в параметре config.
 * Для закрытия такой подсказки следует опубликовать событие {@link closeInfoBox}.
 * @example
 * <pre class="brush: js">
 * // TypeScript
 * this._notify('openInfoBox', [config], {bubbling: true});
 * </pre>
 * @see closeInfoBox
 */

/**
 * @event Происходит при закрытии всплывающей подсказки.
 * @name Controls/_popup/interface/IInfoBox#closeInfoBox
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @see openInfoBox
 * @remark
 * Опубликуйте это событие, чтобы закрыть всплывающую подсказку, которая открыта с помощью события {@link openInfoBox}.
 * @example
 * <pre class="brush: js">
 * // TypeScript
 * this._notify('closeInfoBox', [], {bubbling: true});
 * </pre>
 */
