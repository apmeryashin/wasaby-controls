import { TemplateFunction } from 'UI/Base';

import { View as BaseView } from 'Controls/tree';
import ExpandedCompositeTreeView from './ExpandedCompositeTreeView';

/**
 * Контрол "Развернутое составное дерево" для отображения иерархии в развернутом виде и установке режима отображения элементов на каждом уровне вложенности
 *
 * @public
 * @author Авраменко А.С.
 */
export class View extends BaseView {
    protected _viewName: TemplateFunction = ExpandedCompositeTreeView;

    protected _getModelConstructor(): string {
        return 'Controls/expandedCompositeTree:Collection';
    }

    static getDefaultOptions(): object {
        return {
            compositeNodesLevel: 3
        };
    }
}

Object.defineProperty(View, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return View.getDefaultOptions();
    }
});
