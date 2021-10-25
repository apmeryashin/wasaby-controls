import {TIconSize, TIconStyle} from 'Controls/interface';
import {GroupMixin} from 'Controls/display';

/**
 * Миксин, который содержт логику отображения ячейки группы
 */
export default abstract class GroupCell<T> extends GroupMixin {
    getExpanderClasses(expanderVisible: boolean = true,
                       expanderAlign: 'right' | 'left' = 'left',
                       iconSize: TIconSize,
                       iconStyle: TIconStyle): string {
        let classes = super.getExpanderClasses(expanderVisible, expanderAlign, iconSize, iconStyle);
        if (expanderVisible !== false) {
            classes += ' js-controls-Tree__row-expander';
        }
        return classes;
    }

    protected _getWrapperSeparatorClasses(): string {
        let classes = '';
        classes += ' controls-Grid__no-rowSeparator';
        classes += ' controls-Grid__row-cell_withRowSeparator_size-null';
        return classes;
    }

    protected _getWrapperBaseClasses(templateHighlightOnHover: boolean): string {
        let classes = '';
        classes += ` controls-Grid__row-cell controls-Grid__cell_${this.getStyle()}`;
        classes += ` controls-Grid__row-cell_${this.getStyle()}`;

        return classes;
    }

    isContentCell(): boolean {
        return !(this._$owner.hasColumnScroll() && !this._$isFixed);
    }

    abstract getStyle(): string;
}
