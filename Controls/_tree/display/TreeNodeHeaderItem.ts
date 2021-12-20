import { TemplateFunction } from 'UI/Base';
import { Model } from 'Types/entity';
import TreeItem from './TreeItem';

/**
 * Хедер узла в иерархическом списке
 */

export default class TreeNodeHeaderItem extends TreeItem<null> {
    readonly '[Controls/tree:TreeNodeHeaderItem]': boolean;
    readonly Markable: boolean = false;
    readonly Fadable: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = false;
    readonly ItemActionsItem: boolean = false;

    protected _$moreCaption: string;
    protected _$moreFontColorStyle: string;

    readonly listInstanceName: string =  'controls-Tree__node-header';

    readonly listElementName: string = 'item';

    get node(): TreeItem<Model> {
        return this.getNode();
    }

    getNode(): TreeItem<Model> {
        return this.getParent();
    }

    getTemplate(): TemplateFunction | string {
        return 'Controls/tree:NodeHeaderTemplate';
    }

    needMoreButton(): boolean {
        return this.hasMoreStorage('backward');
    }

    getMoreCaption(): string {
        return this._$moreCaption;
    }

    getItemClasses(): string {
        return 'controls-ListView__itemV controls-Tree__nodeHeader';
    }

    getContentClasses(): string {
        return super.getContentClasses() + ' controls-Tree__itemContentTreeWrapper';
    }

    getExpanderPaddingClasses(tmplExpanderSize?: string): string {
        let classes = super.getExpanderPaddingClasses(tmplExpanderSize);

        classes = classes.replace(
           'controls-TreeGrid__row-expanderPadding',
           'controls-TreeGrid__node-header-expanderPadding'
        );

        return classes;
    }

    getMoreFontColorStyle(): string {
        return this._$moreFontColorStyle;
    }

    setMoreFontColorStyle(moreFontColorStyle: string): void {
        if (this._$moreFontColorStyle !== moreFontColorStyle) {
            this._$moreFontColorStyle = moreFontColorStyle;
            this._nextVersion();
        }
    }

    protected _getLeftSpacingContentClasses(): string {
        if (this._isDefaultRenderMultiSelect()) {
            return ' controls-ListView__itemContent_withCheckboxes';
        } else {
            return ` controls-ListView__item-leftPadding_${this.getOwner().getLeftPadding().toLowerCase()}`;
        }
    }
}

Object.assign(TreeNodeHeaderItem.prototype, {
    '[Controls/tree:TreeNodeHeaderItem]': true,
    _moduleName: 'Controls/tree:TreeNodeHeaderItem',
    _instancePrefix: 'tree-node-header-item-',
    _$moreFontColorStyle: null,
    _$moreCaption: null
});
