import { register } from 'Types/di';

export { ItemTemplate } from 'Controls/list';
import Collection from 'Controls/_expandedCompositeTree/display/Collection';
import CollectionItem from 'Controls/_expandedCompositeTree/display/CollectionItem';
import CompositeCollectionItem from 'Controls/_expandedCompositeTree/display/CompositeCollectionItem';
import * as CompositeItemTemplate from 'wml!Controls/_expandedCompositeTree/render/CompositeItemTemplate';
export { default as CompositeItemWrapper } from 'Controls/_expandedCompositeTree/CompositeItemWrapper';

export { IExpandedCompositeTree } from 'Controls/_expandedCompositeTree/interface/IExpandedCompositeTree';
export { View } from 'Controls/_expandedCompositeTree/ExpandedCompositeTree';

export {
    Collection,
    CollectionItem,
    CompositeCollectionItem,
    CompositeItemTemplate
};

/**
 * Библиотека контролов, для отображения иерархии в развернутом виде и установке режима отображения элементов на каждом уровне вложенности.
 * @library
 * @includes IExpandedCompositeTreeControl Controls/_expandedCompositeTree/interface/IExpandedCompositeTree
 * @public
 * @author Авраменко А.С.
 */

register('Controls/expandedCompositeTree:Collection', Collection, {instantiate: false});
register('Controls/expandedCompositeTree:CollectionItem', CollectionItem, {instantiate: false});
register('Controls/expandedCompositeTree:CompositeCollectionItem', CompositeCollectionItem, {instantiate: false});
