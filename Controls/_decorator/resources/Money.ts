import {IControlOptions} from 'UI/Base';

import {IFontColorStyleOptions} from 'Controls/_interface/IFontColorStyle';
import {IFontWeightOptions} from 'Controls/_interface/IFontWeight';
import {IFontSizeOptions} from 'Controls/_interface/IFontSize';
import {ITooltipOptions} from 'Controls/_interface/ITooltip';
import {INumberFormatOptions} from 'Controls/_interface/INumberFormat';

import {abbreviateNumber, correctNumberValue} from 'Controls/_decorator/resources/Formatter';
import splitIntoTriads from 'Controls/_decorator/inputUtils/splitIntoTriads';
import numberToString from 'Controls/_decorator/inputUtils/toString';

interface IPaths {
    integer: string;
    fraction: string;
    number: string;
}

/**
 * Тип данных для форматируемого значения
 * @typedef {string|number|null} Controls/_decorator/IMoney/TValue
 */
type TValue = string | number | null;

/**
 * Тип данных для аббревиатуры
 * @typedef {string} Controls/_decorator/IMoney/TAbbreviationType
 * @variant long
 * @variant none
 */
type TAbbreviationType = 'long' | 'none';
/**
 * Тип данных для отображаемой валюты
 * @typedef {string} Controls/_decorator/IMoney/TCurrency
 * @variant Ruble
 * @variant Euro
 * @variant Dollar
 */
type TCurrency = 'Ruble' | 'Euro' | 'Dollar';
/**
 * Тип данных для позиции отображаемой валюты
 * @typedef {string} Controls/_decorator/IMoney/TCurrencyPosition
 * @variant right
 * @variant left
 */
type TCurrencyPosition = 'right' | 'left';
/**
 * Тип данных для размера отображаемой валюты
 * @typedef {string} Controls/_decorator/IMoney/TCurrencySize
 * @variant 2xs
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 */
type TCurrencySize = '2xs' | 'xs' | 's' | 'm' | 'l';
/**
 * Тип данных для подчеркивания
 * @typedef {string} Controls/_decorator/IMoney/TUnderline
 * @variant hovered
 * @variant none
 */
type TUnderline = 'hovered' | 'none';
/**
 * Тип данных количества знаков после запятой
 * @typedef {string} Controls/_decorator/IMoney/TPrecision
 * @variant 0
 * @variant 2
 */
type TPrecision = 0 | 2;

export interface IMoneyOptions extends IControlOptions, INumberFormatOptions, ITooltipOptions,
    IFontColorStyleOptions, IFontWeightOptions, IFontSizeOptions {
    /**
     * @name Controls/_decorator/IMoney#value
     * @cfg {Controls/_decorator/IMoney/TValue.typedef} Декорируемое число.
     * @default null
     * @demo Controls-demo/Decorator/Money/Value/Index
     */
    value: TValue;
    /**
     * @name Controls/_decorator/IMoney#abbreviationType
     * @cfg {Controls/_decorator/IMoney/TAbbreviationType.typedef} Тип аббревиатуры.
     * @default none
     * @demo Controls-demo/Decorator/Money/Abbreviation/Index
     */
    abbreviationType?: TAbbreviationType;
    /**
     * @name Controls/_decorator/IMoney#currency
     * @cfg {Controls/_decorator/IMoney/TCurrency.typedef} Отображаемая валюта.
     * @demo Controls-demo/Decorator/Money/Currency/Index
     */
    currency?: TCurrency;
    /**
     * @name Controls/_decorator/IMoney#currencySize
     * @cfg {Controls/_decorator/IMoney/TCurrencySize.typedef} Размер отображаемой валюты.
     * @default s
     * @demo Controls-demo/Decorator/Money/CurrencySize/Index
     */
    currencySize?: TCurrencySize;
    /**
     * @name Controls/_decorator/IMoney#currencyPosition
     * @cfg {Controls/_decorator/IMoney/TCurrencyPosition.typedef} Позиция отображаемой валюты относительно суммы.
     * @default right
     * @demo Controls-demo/Decorator/Money/Currency/Index
     */
    currencyPosition?: TCurrencyPosition;
    /**
     * @name Controls/_decorator/IMoney#underline
     * @cfg {Controls/_decorator/IMoney/TUnderline.typedef} Вариант подчеркивания.
     * @default none
     * @demo Controls-demo/Decorator/Money/Underline/Index
     */
    underline?: TUnderline;
    /**
     * @name Controls/_decorator/IMoney#precision
     * @cfg {Number} Количество знаков после запятой.
     * @default 2
     * @demo Controls-demo/Decorator/Money/Precision/Index
     */
    precision?: TPrecision;
}

export function calculateMainClass(underline: string, style: string): string {
    return 'controls-DecoratorMoney' + `${underline === 'hovered' ? ' controls-DecoratorMoney__underline' : ''}
            ${style ? ' controls-DecoratorMoney_style-' + style : ''}`;
}

export function calculateCurrencyClass(currencySize: string, fontColorStyle: string, fontWeight: string): string {
    return `${currencySize ? 'controls-fontsize-' + currencySize : ''} ${fontColorStyle ? ' controls-text-' + fontColorStyle : ''}
            ${fontWeight ? ' controls-fontweight-' + fontWeight : ''}`;
}

export function calculateStrokedClass(stroked: boolean): string {
    return `${stroked ? 'controls-DecoratorMoney__stroked' : ''}`;
}

export function calculateIntegerClass(
    fontSize: string,
    fontColorStyle: string,
    fontWeight: string,
    currency: string,
    currencyPosition: string,
    isDisplayFractionPath: boolean
): string {
    return `${fontSize ? 'controls-fontsize-' + fontSize : ''} ${fontColorStyle ? ' controls-text-' + fontColorStyle : ''}
            ${fontWeight ? ' controls-fontweight-' + fontWeight : ''} ${currency && currencyPosition === 'left' ? ' controls-margin_left-2xs' + fontWeight : ''}
            ${currency && currencyPosition === 'right' && isDisplayFractionPath ? ' controls-margin_right-2xs' + fontWeight : ''}`;
}

export function calculateFractionClass(
    fraction: string,
    fontColorStyle: string,
    fractionFontSize: string,
    currency: string,
    currencyPosition: string
): string {
    return 'controls-DecoratorMoney__fraction__colorStyle-' + `${fraction === '.00' ? 'readonly' : fontColorStyle}
            ${fractionFontSize ? ' controls-fontsize-' + fractionFontSize : ''}
            ${currency && currencyPosition === 'right' ? ' controls-margin_right-2xs' : ''}`;
}

export function calculateCurrency(currency: string): string {
    const currencies = {
        Ruble: '₽',
        Dollar: '$',
        Euro: '€'
    };

    return currencies[currency];
}

export function calculateFontColorStyle(stroked: boolean, options: IMoneyOptions): string {
    if (options.readOnly || stroked) {
        return 'readonly';
    } else {
        return options.fontColorStyle;
    }
}

export function calculateTooltip(formattedNumber: object, options: IMoneyOptions): string {
    if (options.hasOwnProperty('tooltip')) {
        return options.tooltip;
    }

    return formattedNumber.number;
}

export function isDisplayFractionPath(value: string, showEmptyDecimals: boolean, precision: number): boolean {
    return (showEmptyDecimals || value !== '.00') && !!precision;
}

export function calculateFormattedNumber(
    value: TValue,
    useGrouping: boolean,
    abbreviationType: TAbbreviationType,
    precision: number
): string | IPaths {
    const formattedValue = toFormat(toString(value, precision), precision);

    let [integer, fraction] = splitValueIntoParts(formattedValue);

    if (abbreviationType === 'long') {
        integer = abbreviateNumber(formattedValue, abbreviationType);
    } else {
        integer = useGrouping ? splitIntoTriads(integer) : integer;
    }

    integer = correctNumberValue(integer);

    return {
        integer,
        fraction,
        number: integer + fraction
    };
}

function toFormat(value: string, precision: number): string {
    const dotPosition = value.indexOf('.');

    if (dotPosition === -1) {
        return value + (precision ? '.00' : '');
    }

    if (!precision) {
        return value.substr(0, dotPosition);
    }

    const fractionLength = value.length - dotPosition - 1;
    if (fractionLength < precision) {
        return value + '0'.repeat(precision - fractionLength);
    }

    if (fractionLength > precision) {
        return value.substr(0, dotPosition + precision + 1);
    }

    return value;
}

function toString(value: TValue, precision: number): string {
    if (value === null) {
        return '0' + (precision ? '.00' : '');
    }
    if (typeof value === 'number') {
        return numberToString(value);
    }

    return value;
}

function splitValueIntoParts(value: string): string[] {
    let [integer, fraction] = value.split('.');
    fraction = '.' + fraction;

    return [integer, fraction];
}

export function calculateFractionFontSize(fontSize: string): string {
    if (fontSize === '6xl' || fontSize === '8xl') {
        return '3xl';
    } else {
        return 'xs';
    }
}
