import {TIconSize, TIconStyle} from 'Controls/interface';
import {GroupMixin} from 'Controls/display';

/**
 * Миксин, который содержт логику отображения ячейки группы
 */
export default abstract class GroupCell<T> extends GroupMixin {


    abstract getStyle(): string;
}
