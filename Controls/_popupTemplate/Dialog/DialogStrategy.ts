import {detection} from 'Env/Env';
import {IDialogPopupOptions, IPopupPosition, IPopupSizes} from 'Controls/popup';
import {getPositionProperties, VERTICAL_DIRECTION} from '../Util/DirectionUtil';
import {IDialogItem} from 'Controls/_popupTemplate/Dialog/DialogController';

interface ILimitingSizes {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
}

type Position = ILimitingSizes & IDialogPosition;

interface IDialogPosition {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    width: number;
    height: number;
}

export class DialogStrategy {
    /**
     * Returns popup position
     * @function Controls/_popupTemplate/Dialog/Opener/DialogStrategy#getPosition
     * @param windowData The parameters of the browser window
     * @param containerSizes Popup container sizes
     * @param item Popup configuration
     */
    getPosition(windowData: IPopupPosition = {}, containerSizes: IPopupSizes, item: IDialogItem): Position {
        const popupOptions = item.popupOptions;
        const {
            minWidth, maxWidth,
            minHeight, maxHeight
        }: ILimitingSizes = this._calculateLimitOfSizes(popupOptions, windowData);

        const positionCoordinates = this._getPositionCoordinates(windowData, containerSizes, item);
        const position = this._validateCoordinate(positionCoordinates, maxHeight, maxWidth);

        this._resetMargins(item, position);

        return {
            ...position,
            minWidth, maxWidth,
            minHeight, maxHeight
        };
    }

    private _validateCoordinate(position: IDialogPosition, maxHeight: number, maxWidth: number): IDialogPosition {
        if (position.height > maxHeight) {
            position.height = maxHeight;
        }
        if (position.width > maxWidth) {
            position.width = maxWidth;
        }
        return position;
    }

    private _resetMargins(item: IDialogItem, position: IDialogPosition): void {
        const topOffset = (item.sizes?.margins?.top || 0) + (item.popupOptions?.offset?.vertical || 0);
        const horizontalOffset = (item.sizes?.margins?.left || 0) + (item.popupOptions.offset?.horizontal || 0);
        // Сбрасываю все отступы, которые заданы на css. Они уже учтены в позиции
        if (item.targetCoords || topOffset || horizontalOffset) {
            position.margin = 0;
        }
    }

    /**
     * Получение позиции диалога
     * @param {IPopupPosition} windowData
     * @param {IPopupSizes} containerSizes
     * @param {IDialogItem} popupItem
     * @return {IDialogPosition}
     * @private
     */
    private _getPositionCoordinates(
        windowData: IPopupPosition,
        containerSizes: IPopupSizes,
        popupItem: IDialogItem
    ): IDialogPosition {
        const {
            horizontal: horizontalPositionProperty,
            vertical: verticalPositionProperty
        } = getPositionProperties(popupItem?.popupOptions.resizeDirection);

        if (popupItem.fixPosition) {
            return this._getPositionForFixPositionDialog(
                popupItem.position,
                windowData,
                containerSizes,
                popupItem,
                verticalPositionProperty,
                horizontalPositionProperty
            );
        } else {
            const position: IDialogPosition = this._getDefaultPosition(
                windowData,
                containerSizes,
                popupItem,
                verticalPositionProperty,
                horizontalPositionProperty
            );

            this._updateCoordsByOptions(windowData, popupItem, position);
            return position;
        }
    }

    private _getCoordinate(popupItem: IDialogItem, coordinate: string): number {
        if (popupItem.targetCoords && popupItem.targetCoords[coordinate]) {
            return popupItem.targetCoords[coordinate];
        }
        return popupItem.popupOptions[coordinate];
    }

    private _updateCoordsByOptions(windowData: IPopupPosition, popupItem: IDialogItem,
                                   position: IDialogPosition): void {
        const topCoordinate = this._getCoordinate(popupItem, 'top');
        const isRightCoordinate = typeof popupItem.popupOptions.right !== 'undefined';
        const coordinate = isRightCoordinate ? 'right' : 'left';
        const horizontalCoordinate = this._getCoordinate(popupItem, coordinate);

        if (topCoordinate === undefined && horizontalCoordinate === undefined) {
            return;
        }

        const topOffset = (popupItem.sizes?.margins?.top || 0) + (popupItem.popupOptions.offset?.vertical || 0);
        const horizontalOffset = (popupItem.sizes?.margins?.left || 0) + (popupItem.popupOptions.offset?.horizontal || 0);
        const top = (topCoordinate || 0) + topOffset;
        const horizontalPosition = (horizontalCoordinate || 0) + horizontalOffset;

        if (topCoordinate !== undefined) {
            position.top = top;
        }
        if (horizontalCoordinate !== undefined) {
            const popupWidth = (popupItem.popupOptions.width || popupItem.sizes?.width);
            // Calculating the position when reducing the size of the browser window
            const differenceWindowWidth: number =
                (horizontalPosition + popupWidth) - windowData.width;
            if (differenceWindowWidth > 0) {
                position[coordinate] = horizontalPosition - differenceWindowWidth;
            } else {
                position[coordinate] = horizontalPosition;
            }
        }
    }

    /**
     * Возвращает позицию для центрированного диалога(дефолтное состояние)
     * @param {IPopupPosition} windowData
     * @param {IPopupSizes} containerSizes
     * @param {IDialogItem} item
     * @param {string} verticalPositionProperty
     * @param {string} horizontalPositionProperty
     * @return {IDialogPosition}
     * @private
     */
    private _getDefaultPosition(
        windowData: IPopupPosition,
        containerSizes: IPopupSizes,
        item: IDialogItem,
        verticalPositionProperty: string,
        horizontalPositionProperty: string
    ): IDialogPosition {
        const popupOptions = item.popupOptions;
        const height = this._calculateValue(
            popupOptions,
            containerSizes.height,
            windowData.height,
            parseInt(popupOptions.height, 10),
            popupOptions.maxHeight,
            popupOptions.minHeight
        );
        const width = this._calculateValue(
            popupOptions,
            containerSizes.width,
            windowData.width,
            parseInt(popupOptions.width, 10),
            popupOptions.maxWidth,
            popupOptions.minWidth
        );
        const position = {height, width};

        // Если диалоговое окно открыто через touch, то позиционируем его в самом верху экрана.
        // Это решает проблемы с показом клавиатуры и прыжком контента из-за изменившегося scrollTop.
        // Даем возможность некоторые окна отображать по центру ( например, окно подтверждения)
        // кроме ios, android
        if (
            item.contextIsTouch &&
            !popupOptions.isCentered &&
            !detection.isMobileIOS &&
            !detection.isMobileAndroid
        ) {
            position[verticalPositionProperty] = verticalPositionProperty === VERTICAL_DIRECTION.TOP
                ? 0 : containerSizes.height;
        } else {
            position[verticalPositionProperty] = this._getVerticalPostion(
                windowData,
                height || containerSizes.height,
                popupOptions,
                verticalPositionProperty
            );
        }
        position[horizontalPositionProperty] = this._getHorizontalPosition(
            windowData,
            width || containerSizes.width,
            popupOptions,
            horizontalPositionProperty
        );
        return position;
    }

    /**
     * Получение новой позиции диалога при перетаскивании,
     * с учетом того что он не должен вылететь за родительский контейнер
     * @param {IPopupPosition} popupPosition
     * @param {IPopupPosition} windowData
     * @param {IPopupSizes} containerSizes
     * @param {IDialogItem} popupItem
     * @param {string} verticalPositionProperty
     * @param {string} horizontalPositionProperty
     * @return {IDialogPosition}
     * @private
     */
    private _getPositionForFixPositionDialog(
        popupPosition: IPopupPosition = {},
        windowData: IPopupPosition,
        containerSizes: IPopupSizes,
        popupItem: IDialogItem,
        verticalPositionProperty: string,
        horizontalPositionProperty: string
    ): IDialogPosition {
        const width = popupPosition.width;
        const height = popupPosition.height;
        const horizontalPosition = typeof popupPosition[horizontalPositionProperty] !== 'undefined' ?
            popupPosition[horizontalPositionProperty] : popupItem.popupOptions[horizontalPositionProperty];
        const verticalPosition = typeof popupPosition[verticalPositionProperty] !== 'undefined' ?
            popupPosition[verticalPositionProperty] : popupItem.popupOptions[verticalPositionProperty];
        let horizontalValue = Math.max(0, horizontalPosition);
        let verticalValue = Math.max(0, verticalPosition);

        let diff;
        // check overflowX
        const containerWidth = Math.min(containerSizes.width, width || containerSizes.width);
        diff = (horizontalPosition + containerWidth) -
            (windowData.width + windowData.left);
        horizontalValue -= Math.max(0, diff || 0);
        if (horizontalValue < 0) {
            horizontalValue = 0;
        }

        // check overflowY
        const containerHeight = Math.min(containerSizes.height, height || containerSizes.height);
        diff = (verticalPosition + containerHeight) -
            (windowData.height + windowData.top);
        verticalValue -= Math.max(0, diff || 0);
        if (verticalValue < 0) {
           verticalValue = 0;
        }

        return {
            height,
            width,
            [horizontalPositionProperty]: horizontalValue,
            [verticalPositionProperty]: verticalValue
        };
    }

    private _calculateLimitOfSizes(popupOptions: IDialogPopupOptions = {}, windowData: IPopupPosition): ILimitingSizes {
        let maxHeight = popupOptions.maxHeight || windowData.height;
        if (windowData.height < popupOptions.top + maxHeight) {
            maxHeight = windowData.height - popupOptions.top;
        }
        return {
            minWidth: popupOptions.minWidth,
            minHeight: popupOptions.minHeight,
            maxHeight: Math.min(maxHeight, windowData.height),
            maxWidth: Math.min(popupOptions.maxWidth || windowData.width, windowData.width)
        };
    }

    private _calculateValue(
        popupOptions: IDialogPopupOptions = {},
        containerValue: number,
        windowValue: number,
        popupValue: number,
        maxValue: number,
        minValue: number
    ): number {
        // Если 0, NaN, null ставлю undefined, чтобы шаблонизатор не добавил в аттрибуты
        let value = popupValue || undefined;
        const availableMaxSize = maxValue ? Math.min(windowValue, maxValue) : windowValue;
        const availableMinSize = minValue ? minValue : 0;
        if (popupOptions.maximize) {
            return windowValue;
        } else if (!containerValue && !popupValue) {
            // Если считаем размеры до построения контрола и размеры не задали на опциях
            return undefined;
        }

        if (containerValue >= availableMaxSize || popupValue >= availableMaxSize) {
            value = Math.max(availableMaxSize, availableMinSize);
        }
        if (containerValue < availableMinSize || popupValue < availableMinSize) {
            value = availableMinSize;
        }
        return value;
    }

    private _isIOS13(): boolean {
        return detection.isMobileIOS && detection.IOSVersion > 12;
    }

    /**
     * Получение горизонтального отступа для центрированного диалога с учетом resizeDirection
     * @param windowData
     * @param width
     * @param popupOptions
     * @param horizontalPositionProperty
     * @return {number}
     * @private
     */
    private _getHorizontalPosition(
        windowData: IPopupPosition,
        width: number,
        popupOptions: IDialogPopupOptions,
        horizontalPositionProperty: string
    ): number {
        // Position from prop storage
        const optionsPosition = popupOptions[horizontalPositionProperty];
        if (popupOptions[horizontalPositionProperty]) {
            return optionsPosition;
        }
        if (!width) {
            return;
        }

        const wWidth = windowData.width;
        const windowOffset = (windowData.leftScroll + windowData.left) || 0;
        if (popupOptions.maximize) {
            return windowOffset;
        }
        return windowOffset + Math.max(Math.round((wWidth - width) / 2), 0);
    }

    private _getVerticalPostion(
        windowData: IPopupPosition,
        height: number,
        popupOptions: IDialogPopupOptions,
        verticalPositionProperty: string
    ): number {
        // Position from prop storage
        const optionsPosition = popupOptions[verticalPositionProperty];
        if (popupOptions[verticalPositionProperty]) {
            return optionsPosition;
        }

        if (popupOptions.maximize) {
            return 0;
        }
        if (!height) {
            return;
        }
        const middleCoef = 2;
        const top = windowData.topScroll + windowData.top;
        let scrollTop: number = top || 0;

        // только на ios13 scrollTop больше чем нужно. опытным путем нашел коэффициент
        if (this._isIOS13()) {
            scrollTop /= middleCoef;
        }
        return Math.round((windowData.height - height) / middleCoef) + scrollTop;
    }
}

export default new DialogStrategy();
