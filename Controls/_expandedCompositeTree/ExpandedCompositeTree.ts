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
}
