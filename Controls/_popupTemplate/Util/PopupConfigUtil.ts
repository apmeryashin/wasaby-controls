import {IStickyItem, IStickyPositionConfig} from 'Controls/_popupTemplate/Sticky/StickyController';
import {IPopupSizes, IStickyPopupOptions, IStickyPosition} from 'Controls/popup';
import * as cMerge from 'Core/core-merge';
import * as cClone from 'Core/core-clone';
import * as cInstance from 'Core/core-instance';
import getTargetCoords, {ITargetCoords} from 'Controls/_popupTemplate/TargetCoords';
import {constants, detection} from 'Env/Env';
import {DimensionsMeasurer} from 'Controls/sizeUtils';

const DEFAULT_OPTIONS = {
    direction: {
        horizontal: 'right',
        vertical: 'bottom'
    },
    offset: {
        horizontal: 0,
        vertical: 0
    },
    targetPoint: {
        vertical: 'top',
        horizontal: 'left'
    },
    fittingMode: {
        horizontal: 'adaptive',
        vertical: 'adaptive'
    }
};

const prepareOriginPoint = (config: IStickyPopupOptions): IStickyPopupOptions => {
    const newCfg = {...config};
    newCfg.direction = newCfg.direction || {};
    newCfg.offset = newCfg.offset || {};

    if (typeof config.fittingMode === 'string') {
        newCfg.fittingMode = {
            vertical: config.fittingMode,
            horizontal: config.fittingMode
        };
    } else {
        if (config.fittingMode) {
            if (!config.fittingMode.vertical) {
                newCfg.fittingMode.vertical = 'adaptive';
            }
            if (!config.fittingMode.horizontal) {
                newCfg.fittingMode.horizontal = 'adaptive';
            }
        }
    }
    if (!config.fittingMode) {
        newCfg.fittingMode = DEFAULT_OPTIONS.fittingMode;
    }
    return newCfg;
};

const getRestrictiveContainerCoords = (item: IStickyItem): ITargetCoords => {
    if (item.popupOptions.restrictiveContainer) {
        let restrictiveContainer;
        if (cInstance.instanceOfModule(item.popupOptions.restrictiveContainer, 'UI/Base:Control')) {
            restrictiveContainer = item.popupOptions.restrictiveContainer._container;
        } else if (item.popupOptions.restrictiveContainer instanceof HTMLElement) {
            restrictiveContainer = item.popupOptions.restrictiveContainer;
        } else if (typeof item.popupOptions.restrictiveContainer === 'string') {
            // ищем ближайшего
            if (item.popupOptions.target instanceof HTMLElement) {
                restrictiveContainer = item.popupOptions.target.closest(item.popupOptions.restrictiveContainer);
            }
            if (!restrictiveContainer) {
                restrictiveContainer = document.querySelector(item.popupOptions.restrictiveContainer);
            }
        }

        if (restrictiveContainer) {
            return getTargetCoords(restrictiveContainer);
        }
    }
};

export const _getWindowWidth = (element?: HTMLElement): number => {
    return constants.isBrowserPlatform && DimensionsMeasurer.getWindowDimensions(element).innerWidth;
};

export const _getWindowHeight = (element?: HTMLElement): number => {
    return constants.isBrowserPlatform && DimensionsMeasurer.getWindowDimensions(element).innerHeight;
};

const calcSizes = (params = {}): object => {
    const isPercentValue = (value) => (typeof value === 'string') && value.includes('%');
    const calcPercent = (windowSize, percent) => windowSize * percent / 100;

    if (isPercentValue(params.height)) {
        const percent = parseInt(params.height, 10);
        params.height = calcPercent(_getWindowHeight(), percent);
    }

    if (isPercentValue(params.width)) {
        const percent = parseInt(params.width, 10);
        params.width = calcPercent(_getWindowWidth(), percent);
    }
    return params;
};

export function getStickyConfig(item: IStickyItem, sizes: IPopupSizes = {}): IStickyPositionConfig {
    item.popupOptions = prepareOriginPoint(item.popupOptions);
    const restrictiveContainerCoords = getRestrictiveContainerCoords(item);
    const config = {
        width: item.popupOptions.width,
        height: item.popupOptions.height,
        minWidth: item.popupOptions.minWidth,
        minHeight: item.popupOptions.minHeight,
        maxWidth: item.popupOptions.maxWidth,
        maxHeight: item.popupOptions.maxHeight
    };
    return {
        targetPoint: cMerge(cClone(DEFAULT_OPTIONS.targetPoint), item.popupOptions.targetPoint || {}),
        restrictiveContainerCoords,
        direction: cMerge(cClone(DEFAULT_OPTIONS.direction), item.popupOptions.direction || {}),
        offset: cMerge(cClone(DEFAULT_OPTIONS.offset), item.popupOptions.offset || {}),
        config: calcSizes(config),
        sizes: calcSizes(sizes),
        fittingMode: item.popupOptions.fittingMode as IStickyPosition,
        fixPosition: item.fixPosition,
        position: calcSizes(item.position)
    };
}

export function getStickyDefaultPosition(item, target) {
    const sizes = calcSizes(item.popupOptions);
    const position = {
        top: -10000,
        left: -10000,
        minWidth: item.popupOptions.minWidth,
        maxWidth: item.popupOptions.maxWidth || _getWindowWidth(target),
        minHeight: item.popupOptions.minHeight,
        maxHeight: item.popupOptions.maxHeight || _getWindowHeight(target),
        width: sizes.width,
        height: sizes.height,

        // Error on ios when position: absolute container is created outside the screen and stretches the page
        // which leads to incorrect positioning due to incorrect coordinates. + on page scroll event firing
        // Treated position:fixed when positioning pop-up outside the screen
        position: 'fixed'
    };

    if (detection.isMobileIOS) {
        position.top = 0;
        position.left = 0;
        position.invisible = true;
    }

    return position;
}

export function getRoundClass({hasRoundedBorder, options, type}): string {
    if (hasRoundedBorder) {
        if (type === 'header') {
            if (!(options.bodyContentTemplate || options.footerContentTemplate)) {
                return `controls-PopupTemplate__roundBorder_bottom controls_border-radius-${options.borderRadius || 's'}`;
            }
        } else if (type === 'body') {
            if (!(options.headingCaption || options.headerContentTemplate)) {
                if (options.footerContentTemplate) {
                    return `controls-PopupTemplate__roundBorder_top controls_border-radius-${options.borderRadius || 's'}`;
                } else {
                    return `controls-PopupTemplate__roundBorder controls_border-radius-${options.borderRadius || 's'}`;
                }
            } else {
                if (!options.footerContentTemplate) {
                    return `controls-PopupTemplate__roundBorder_bottom  controls_border-radius-${options.borderRadius || 's'}`;
                }
            }
        }
    }
}
