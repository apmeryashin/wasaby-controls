import { Control, TemplateFunction } from 'UI/Base';
import * as CompositeItemWrapperTemplate from 'wml!Controls/_expandedCompositeTree/render/CompositeItemWrapper';

/**
 * Контрол - обертка для трансляции событий через слой композитного элемента
 *
 * @public
 * @author Авраменко А.С.
 */
export default class CompositeItemWrapper extends Control {
    protected _template: TemplateFunction = CompositeItemWrapperTemplate;

    protected _onItemMouseEnter(event, item, nativeEvent): void {
        this._notify('itemMouseEnter', [item, nativeEvent], { bubbling: true });
    }

    protected _onItemMouseDown(event, item, nativeEvent): void {
        this._notify('itemMouseDown', [item, nativeEvent], { bubbling: true });
    }

    protected _onItemMouseUp(event, item, nativeEvent): void {
        this._notify('itemMouseUp', [item, nativeEvent], { bubbling: true });
    }

    protected _onItemClick(event, item, nativeEvent): void {
        this._notify('itemClick', [item, nativeEvent], { bubbling: true });
    }

    protected _onItemContextMenu(event, item, nativeEvent): void {
        this._notify('itemContextMenu', [item, nativeEvent], { bubbling: true });
    }
}
