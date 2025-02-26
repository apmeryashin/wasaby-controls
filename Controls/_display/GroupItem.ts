import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import ExpandableMixin, {IOptions as IExpandableMixinOptions} from './ExpandableMixin';
import {mixin} from 'Types/util';
import {TemplateFunction} from 'UI/Base';
import GroupMixin from './GroupMixin';

interface IOptions<T> extends ICollectionItemOptions<T>, IExpandableMixinOptions {
}

/**
 * Элемент коллекции "Группа"
 * @extends Controls/_display/CollectionItem
 * @mixes Controls/display:ExpandableMixin
 * @public
 * @author Авраменко А.С.
 */
export default class GroupItem<T> extends mixin<
    CollectionItem<any>,
    ExpandableMixin,
    GroupMixin
>(
    CollectionItem,
    ExpandableMixin,
    GroupMixin
) {
    readonly EditableItem: boolean = false;
    readonly '[Controls/_display/GroupItem]': true;

    readonly Markable: boolean = false;
    readonly Fadable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = true;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;

    protected _$multiSelectVisibility: string;

    readonly listElementName: string =  'group';

    constructor(options?: IOptions<T>) {
        super(options);
        ExpandableMixin.call(this);
    }

    get key(): T {
        return this._$contents;
    }

    isHiddenGroup(): boolean {
        return this._$contents === 'CONTROLS_HIDDEN_GROUP';
    }

    setMultiSelectVisibility(multiSelectVisibility: string): boolean {
        const multiSelectVisibilityUpdated = this._$multiSelectVisibility !== multiSelectVisibility;
        if (multiSelectVisibilityUpdated) {
            this._$multiSelectVisibility = multiSelectVisibility;
            this._nextVersion();
            return true;
        }
        return false;
    }

    getGroupPaddingClasses(side: 'left' | 'right'): string {
        if (side === 'left') {
            const spacing = this.getOwner().getLeftPadding().toLowerCase();
            const hasMultiSelect = this.getOwner().getMultiSelectVisibility() !== 'hidden';
            return `controls-ListView__groupContent__leftPadding_${hasMultiSelect ? 'withCheckboxes' : spacing}`;
        } else {
            const spacing = this.getOwner().getRightPadding().toLowerCase();
            return `controls-ListView__groupContent__rightPadding_${spacing}`;
        }
    }

    getTemplate(itemTemplateProperty: string,
                userItemTemplate: TemplateFunction | string,
                userGroupTemplate?: TemplateFunction | string): TemplateFunction | string {
        return userGroupTemplate || 'Controls/listRender:groupTemplate';
    }

    setExpanded(expanded: boolean, silent?: boolean): void {
        super.setExpanded(expanded, silent);
        this._nextVersion();
    }

    isSticked(): boolean {
        return this._$owner.isStickyGroup() && !this.isHiddenGroup();
    }

    // TODO Убрать после https://online.sbis.ru/opendoc.html?guid=b8c7818f-adc8-4e9e-8edc-ec1680f286bb
    isIosZIndexOptimized(): boolean {
        return false;
    }
}

Object.assign(GroupItem.prototype, {
    '[Controls/_display/GroupItem]': true,
    _moduleName: 'Controls/display:GroupItem',
    _instancePrefix: 'group-item-',
    _$multiSelectVisibility: null
});
