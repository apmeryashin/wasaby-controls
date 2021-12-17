import {TreeItem} from 'Controls/display';
import PropertyGridCollection from './PropertyGridCollection';
import {DEFAULT_EDITORS, DEFAULT_VALIDATORS_BY_TYPE, DEFAULT_VALIDATOR_TEMPLATE} from './Constants';
import {Enum} from 'Types/collection';
import * as getType from 'Core/helpers/getType';
import {Model} from 'Types/entity';
import {object} from 'Types/util';
import {IGridCollectionOptions} from 'Controls/grid';
import {ILabelOptions} from 'Controls/input';

/**
 * Элемент коллеции propertyGrid
 *
 * @class Controls/_propertyGrid/PropertyGridCollectionItem
 * @extends Controls/_display/TreeItem
 * @public
 * @author Мельникова Е.А.
 */

export default class PropertyGridCollectionItem<T> extends TreeItem<T> {
    protected _$owner: PropertyGridCollection<T>;

    /**
     * Текущее значение элемента
     */
    protected _$propertyValue: unknown;

    /**
     * Имя свойства, содержащего информацию об идентификаторе элемента
     */
    protected _$keyProperty: string;

    constructor(options?: IGridCollectionOptions) {
        super(options);
        this._$keyProperty = options.keyProperty;
        this.setPropertyValue(options.editingObject);
    }

    getEditorTemplateName(): string {
        const itemContents = this.getContents();
        const editorTemplateName = itemContents.get('editorTemplateName');
        const type = itemContents.get('type');
        const propertyValue = this._$propertyValue;

        if (editorTemplateName || DEFAULT_EDITORS[type]) {
            return editorTemplateName || DEFAULT_EDITORS[type];
        }
        if (getType(propertyValue) === 'object') {
            if (propertyValue instanceof Enum) {
                return DEFAULT_EDITORS.enum;
            }
        }
        return DEFAULT_EDITORS[getType(propertyValue)];
    }

    getEditorClasses(): string {
        const itemContents = this.getContents();
        const classes = [];
        const editorClass = itemContents.get('editorClass');
        const caption = itemContents.get('caption');
        const captionPosition = this.getOwner().getCaptionPosition();

        if (editorClass) {
            classes.push(editorClass);
        }

        if (!caption || captionPosition === 'top' || captionPosition === 'none') {
            classes.push('controls-PropertyGrid__editor-withoutCaption');
        }

        return classes.join(' ');
    }

    getItemPaddingClasses(gridColumnIndex?: number): string {
        const owner = this.getOwner();
        const itemContents = this.getContents();
        const editorOptions = itemContents.get('editorOptions');
        const captionPosition = this.getOwner().getCaptionPosition();
        const totalColumns = !gridColumnIndex || captionPosition !== 'left' ? 1 : 2;

        let classes = `controls-PropertyGrid__editor_spacingTop_${owner.getTopPadding()}
                       controls-PropertyGrid__editor_spacingBottom_${owner.getBottomPadding()}`;
        if (gridColumnIndex !== totalColumns || totalColumns === 1) {
            classes += ` controls-PropertyGrid__editor_spacingRight_${owner.getRightPadding()}`;
        }
        if (gridColumnIndex !== totalColumns || totalColumns === 1 ||
            !(itemContents.get('caption') || itemContents.get('isEditable')) ||
            editorOptions?.jumpingLabel) {
            classes += ` controls-PropertyGrid__editor_spacingLeft_${owner.getLeftPadding()}`;
        }
        return classes;
    }

    getCheckboxPaddingClasses(): string {
        const owner = this.getOwner();
        return `controls-PropertyGrid__editor_spacingTop_${owner.getTopPadding()}
                controls-PropertyGrid__editor_spacingBottom_${owner.getBottomPadding()}`;
    }

    getEditorOptions(): object {
        return this.getContents().get('editorOptions') || {};
    }

    getEditorReadOnly(templateReadOnly: boolean): boolean {
        const editorOptions = this.getEditorOptions();
        return editorOptions.hasOwnProperty('readOnly') ? editorOptions.readOnly : templateReadOnly;
    }

    getValidateTemplateName(): string {
        const type = this.getContents().get('type');
        const validators = this.getValidators();
        if (validators) {
            return this.getContents().get('validateTemplateName') ||
                   DEFAULT_VALIDATORS_BY_TYPE[type] ||
                   DEFAULT_VALIDATOR_TEMPLATE;
        }
        return '';
    }

    getPropertyLevel(): number {
        const currentLevel = this.getLevel();
        if (this.isNode()) {
            return currentLevel;
        } else {
            return currentLevel - 1;
        }
    }

    getValidateTemplateOptions(): Record<string, unknown> {
        return this.getContents().get('validateTemplateOptions') || {};
    }

    getValidators(): Function[] | null {
        return this.getContents().get('validators');
    }

    getUid(): string {
        return `property-grid-item-${this.getContents().get(this._$keyProperty)}`;
    }

    getPropertyValue(): any {
        return this._$propertyValue;
    }

    setPropertyValue(editingObject: Object | Model | Record<string, any>): void {
        const itemContents = this.getContents();
        this._$propertyValue = object.getPropertyValue(editingObject, itemContents.get(this._$keyProperty));
        this._nextVersion();
    }

    getOwner(): PropertyGridCollection<T> {
        return super.getOwner() as PropertyGridCollection<T>;
    }
}

Object.assign(PropertyGridCollectionItem.prototype, {
    '[Controls/_propertyGrid/PropertyGridCollectionItem]': true,
    _moduleName: 'Controls/propertyGrid:PropertyGridCollectionItem'
});
