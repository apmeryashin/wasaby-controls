import {IDragOffset, IPopupItem, IPopupPosition, IPopupSizes, ISlidingPanelPopupOptions} from 'Controls/popup';
import {constants} from 'Env/Env';
import {DimensionsMeasurer} from 'Controls/sizeUtils';

export enum AnimationState {
    initializing = 'initializing',
    showing = 'showing',
    closing = 'closing'
}

export interface ISlidingPanelItem extends IPopupItem {
    popupOptions: ISlidingPanelPopupOptions;
    animationState: AnimationState;
    dragStartHeight: number;
    dragOffset: IDragOffset;
    previousSizes: IPopupSizes;
    heightForRestoreAfterResize: number;
}

export enum ResizeType {
    inner = 'inner',
    outer = 'outer',
    orientationChange = 'orientationChange'
}

type TRestrictiveContainerCoords = IPopupPosition | void;

const INVERTED_POSITION_MAP = {
    top: 'bottom',
    bottom: 'top'
};

const DEFAULT_POSITION_VALUE = 0;

class Strategy {

    /**
     * Returns popup position
     * @function Controls/_popupSliding/Strategy#getPosition
     * @param item Popup configuration
     * @param restrictiveContainerCoords координаты контейнера внутри которого позиционируемся
     * @param resizeType Не пустой, если пересчет позиции происходит при ресайзе окна браузера или контента внутри попапа
     */
    getPosition(item: ISlidingPanelItem,
                restrictiveContainerCoords?: TRestrictiveContainerCoords,
                resizeType?: ResizeType): IPopupPosition {
        const windowHeight = this._getWindowHeight();
        const {position: popupPosition = {}, popupOptions} = item;
        const {
            slidingPanelOptions: {
                position,
                autoHeight
            } = {}
        } = popupOptions;
        const maxHeight =
            this._getHeightWithoutOverflow(this.getMaxHeight(item, restrictiveContainerCoords), windowHeight);
        const minHeight =
            this._getHeightWithoutOverflow(this.getMinHeight(item, restrictiveContainerCoords), maxHeight);
        const initialHeight = this._getHeightWithoutOverflow(popupPosition.height, maxHeight);
        const heightInitialized = initialHeight !== undefined;
        let height;

        // Высота может быть 0, если пользователь утащит вниз до конца при закрытии, поэтому проверяем на undefined,
        // чтобы не убрать фиксированную высоту когда стащат до 0,
        // иначе с высотой undefined шторка растянется по контенту
        if (heightInitialized) {
            height = initialHeight;
        } else if (autoHeight) {
            const currSize = item.sizes.height;
            const oldSize = item.previousSizes?.height || 0;

            // При автовысоте при изменении размера контента даем шторке только увеличиваться,
            // при уменьшении фиксируем высоту.
            // https://online.sbis.ru/open_dialog.html?guid=89bd5ff3-4a41-48e5-88b9-1e53c188fc33
            if (resizeType === ResizeType.inner && currSize < oldSize) {
                height = oldSize;
            } else {
                height = undefined;
            }
        } else {
            height = minHeight;
        }

        // В случае ресайза, проверяем на валидность высоты,
        // т.к. высота могла быть уменьшена по размеру экрана
        // и оказаться меньше минимальной после восстановления высоты экрана
        if (resizeType && height < minHeight) {
            height = minHeight;
        }
        return {
            left: restrictiveContainerCoords ? restrictiveContainerCoords.left : 0,
            right: restrictiveContainerCoords ? (this._getWindowWidth() - restrictiveContainerCoords.right) : 0,
            [position]: DEFAULT_POSITION_VALUE,
            maxHeight,
            height,
            position: 'fixed'
        };
    }

    /**
     * Получение позиции перед октрытием
     * @param item
     */
    getStartPosition(item: ISlidingPanelItem, restrictiveContainerCoords: TRestrictiveContainerCoords): IPopupPosition {
        const positionOption = item.popupOptions.slidingPanelOptions.position;
        const containerHeight = item.sizes?.height;
        const windowHeight = this._getWindowHeight();
        const position = this.getPosition(item, restrictiveContainerCoords);

        /*
            Если у нас нет размеров контейнера, то это построение и мы позиционируем окно за пределами экрана
            Если размеры есть, то это ресайз, запущенный до окончания анимации, поэтому выполняем ресайз
         */
        this._setInvertedPosition(
            position,
            positionOption,
            containerHeight ? windowHeight - containerHeight : windowHeight
        );
        return position;
    }

    /**
     * Запуск анимации показа окна
     * @param item
     */
    getShowingPosition(item: ISlidingPanelItem,
                       restrictiveContainerCoords: TRestrictiveContainerCoords): IPopupPosition {
        const positionOption = item.popupOptions.slidingPanelOptions.position;
        const position = this.getPosition(item, restrictiveContainerCoords);
        this._setInvertedPosition(position, positionOption, this._getWindowHeight() - item.sizes.height);
        return  position;
    }

    /**
     * Запуск анимации сворачивания окна
     * @param item
     */
    getHidingPosition(item: ISlidingPanelItem,
                      restrictiveContainerCoords: TRestrictiveContainerCoords): IPopupPosition {
        const positionOption = item.popupOptions.slidingPanelOptions.position;
        const position = this.getPosition(item, restrictiveContainerCoords);
        position[positionOption] = -item.sizes.height;
        return  position;
    }

    getMaxHeight({popupOptions: {slidingPanelOptions}}: ISlidingPanelItem,
                 restrictiveContainerCoords: TRestrictiveContainerCoords): number {
        const {heightList, maxHeight} = slidingPanelOptions;
        const windowHeight = this._getWindowHeight();
        const computedMaxHeight = heightList ? heightList[heightList.length - 1] : maxHeight;
        return this._getHeightWithoutOverflow(computedMaxHeight || windowHeight, windowHeight);
    }

    getMinHeight({popupOptions: {slidingPanelOptions}}: ISlidingPanelItem,
                 restrictiveContainerCoords: TRestrictiveContainerCoords): number {
        const {heightList, minHeight} = slidingPanelOptions;
        const windowHeight = this._getWindowHeight();
        const computedMinHeight = heightList ? heightList[0] : minHeight;
        return this._getHeightWithoutOverflow(computedMinHeight, windowHeight);
    }

    getPositionAfterDrag(item: ISlidingPanelItem,
                         restrictiveContainerCoords: TRestrictiveContainerCoords): IPopupPosition {
        const {popupOptions, position} = item;
        const heightList = popupOptions.slidingPanelOptions?.heightList;
        if (heightList) {
            const height = position.height;
            for (let i = 0; i < heightList.length; i++) {
                const nextStep = heightList[i];
                if (height <= nextStep) {
                    const previousStep = heightList[i - 1] || 0;
                    const previousStepDifference = height - previousStep;
                    const nextStepDifference = nextStep - height;
                    position.height = previousStepDifference < nextStepDifference ? previousStep : nextStep;
                    return this.getPosition(item, restrictiveContainerCoords);
                }
            }
        }
        return position;
    }

    /**
     * Возвращает высоту с защитой от переполнения
     * @param {number} height
     * @param {number} maxHeight
     * @return {number}
     * @private
     */
    private _getHeightWithoutOverflow(height: number, maxHeight: number): number {
        if (!height) {
            return height;
        }
        // При очередном драге вниз высота может стать отрицательной, если драгают вниз с нулевой высоты,
        // отрицательной высоты быть не должно
        const result = maxHeight > height ? height : maxHeight;
        return result < 0 ? 0 : result;
    }

    /**
     * Получение доступного пространства для отображения попапа
     * @return {number}
     * @private
     */
    private _getWindowHeight(): number {
        return DimensionsMeasurer.getVisualViewportDimensions().height;
    }

    /**
     * Получение ширины окна
     * @return {number}
     * @private
     */
    private _getWindowWidth(): number {
        return DimensionsMeasurer.getVisualViewportDimensions().width;
    }

    /**
     * Устанавливает противоположную позицию, удаляя дефолтное значение.
     * Нужно для того, чтобы изначально спозиционировать окно
     * неизвестного размера на краю экрана + за пределами вьюпорта.
     * (Пример: Если окно открывается снизу, то top: windowHeight)
     * @param position
     * @param property
     * @param value
     * @private
     */
    private _setInvertedPosition(position: IPopupPosition, property: string, value: number): void {
        delete position[property];
        position[INVERTED_POSITION_MAP[property]] = value;
    }
}

export {
    Strategy
};

export default new Strategy();
