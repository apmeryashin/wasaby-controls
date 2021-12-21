
/**
 * Базовый интерфейс для контроллов, позволяющих визуально отображать процесс изменения других контролов при помощи перемещения мыши.
 *
 * @interface Controls/_dragnDrop/interface/IResizingBase
 * @public
 * @author Красильников А.С.
 */

export interface IResizingBase {
    maxOffset: number;
    minOffset: number;
}

/**
 * @name Controls/_dragnDrop/interface/IResizingBase#maxOffset
 * @cfg {Number} Максимальное значение сдвига при изменении значения размера
 * @default 1000
 * @remark
 * Сдвиг больше указанного визуально отображаться не будет. Для возможности сдвига вдоль направления оси maxOffset должен быть > 0
 */

/**
 * @name Controls/_dragnDrop/interface/IResizingBase#minOffset
 * @cfg {Number} Минимальное значение сдвига при изменении значения размера
 * @default 1000
 * @remark
 * Сдвиг меньше указанного визуально отображаться не будет. Для возможности сдвига против направления оси minOffset должен быть < 0
 */
