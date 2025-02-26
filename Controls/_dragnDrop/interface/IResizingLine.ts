import {Direction} from 'Controls/_dragnDrop/Type/Direction';
import {IResizingBase} from 'Controls/_dragnDrop/interface/IResizingBase';

/**
 * Интерфейс для контроллов, позволяющих визуально отображать процесс изменения других контролов при помощи перемещения мыши.
 *
 * @interface Controls/_dragnDrop/interface/IResizingLine
 * @public
 * @author Мочалов М.А.
 */

export interface IResizingLine extends IResizingBase {
    readonly '[Controls/_dragnDrop/interface/IResizingLine]': boolean;
    direction: Direction;
    orientation: string;
}

/**
 * @name Controls/_dragnDrop/interface/IResizingLine#direction
 * @cfg {String} Задает направление оси для сдвига
 * @variant direct Прямое направление. Слева направо
 * @variant reverse Обратное направление. Справа налево
 * @default direct
 * @remark
 * Влияет на то, каким будет результат события offset. Если сдвиг идет вдоль направления оси, offset положительный. Если против, то отрицательный
 * @see event offset()
 */

/**
 * @name Controls/_dragnDrop/interface/IResizingLine#orientation
 * @cfg {String} Направление изменения размеров
 * @variant vertical Изменение размеров по вертикали
 * @variant horizontal Изменение размеров по горизонтале
 * @default horizontal
 */

/**
 * @event Происходит после перетаскивания мыши, когда клавиша мыши отпущена.
 * @name Controls/_dragnDrop/interface/IResizingLine#offset
 * @param {Number|null} offset Значение сдвига
 * @remark Зависит от направления оси
 * @see direction
 */

/**
 * @event Происходит при перемещении линии.
 * @name Controls/_dragnDrop/interface/IResizingLine#dragMove
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {dragObject} dragObject Объект, в котором содержится информация о текущем состоянии Drag'n'drop.
 */
