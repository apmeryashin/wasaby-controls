import {PropertyGridCollection} from 'Controls/propertyGrid';
import {PROPERTY_NAME_FIELD,
        DEFAULT_VALIDATOR_TEMPLATE,
        DEFAULT_EDITORS,
        DEFAULT_VALIDATORS_BY_TYPE
} from 'Controls/_propertyGrid/Constants';
import {assert} from 'chai';
import {Model} from 'Types/entity';
import {default as IPropertyGridItem} from 'Controls/_propertyGrid/IProperty';
import {Enum, RecordSet} from 'Types/collection';

const editingObject = new Model<IPropertyGridItem>({
    rawData: {
        description: 'This is http://mysite.com',
        tileView: true,
        showBackgroundImage: true,
        siteUrl: 'http://mysite.com',
        videoSource: 'http://youtube.com/video',
        backgroundType: new Enum({
            dictionary: ['Фоновое изображение', 'Заливка цветом'],
            index: 0
        }),
        function: '',
        validate: ''
    }
});
const source = new RecordSet<IPropertyGridItem>({
    rawData: [
        {
            name: 'description',
            caption: 'Описание',
            isEditable: true,
            editorOptions: {
                minLines: 3,
                readOnly: true
            },
            editorClass: 'controls-demo-pg-text-editor',
            group: 'text',
            type: 'text'
        },
        {
            name: 'tileView',
            isEditable: false,
            caption: 'Список плиткой',
            group: 'boolean'
        },
        {
            name: 'showBackgroundImage',
            isEditable: false,
            caption: 'Показывать изображение',
            group: 'boolean'
        },
        {
            caption: 'URL',
            isEditable: false,
            name: 'siteUrl',
            group: 'string'
        },
        {
            caption: 'Источник видео',
            name: 'videoSource',
            isEditable: false,
            validators: [() => true],
            group: 'string'
        },
        {
            caption: 'Тип фона',
            name: 'backgroundType',
            isEditable: false,
            group: 'enum',
            editorClass: 'controls-demo-pg-enum-editor'
        },
        {
            name: 'function',
            caption: '',
            toggleEditorButtonIcon: 'icon-ArrangePreview',
            isEditable: false,
            type: 'text',
            editorClass: 'controls-demo-pg-text-editor',
            editorOptions: {
                placeholder: 'Условие видимости поля',
                minLines: 3,
                jumpingLabel: true
            }
        },
        {
            name: 'validate',
            caption: '',
            toggleEditorButtonIcon: 'icon-CreateFolder',
            isEditable: false,
            type: 'text',
            editorClass: 'controls-demo-pg-text-editor',
            editorTemplateName: 'editorTemplate',
            validators: [() => true],
            editorOptions: {
                placeholder: 'Условие валидации',
                minLines: 3
            }
        },
        {
            name: 'customValidateTemplate',
            caption: '',
            toggleEditorButtonIcon: 'icon-CreateFolder',
            isEditable: false,
            type: 'text',
            editorClass: 'controls-demo-pg-text-editor',
            validateTemplateName: 'validateTemplate',
            validators: [() => true],
            editorTemplateName: 'editorTemplate',
            editorOptions: {
                placeholder: 'Условие валидации',
                minLines: 3
            }
        },
        {
            name: 'customEditor',
            caption: '',
            toggleEditorButtonIcon: 'icon-CreateFolder',
            isEditable: false,
            type: 'text',
            editorClass: 'controls-demo-pg-text-editor',
            editorTemplateName: 'editorTemplate',
            editorOptions: {
                placeholder: 'Условие валидации',
                minLines: 3
            }
        }
    ],
    keyProperty: 'name'
});
const collection = new PropertyGridCollection<Model>({
    collection: source,
    editingObject,
    parentProperty: 'Раздел',
    nodeProperty: 'Раздел@',
    keyProperty: PROPERTY_NAME_FIELD,
    root: null
});

const hierarchySource = new RecordSet<IPropertyGridItem>({
    rawData: [
        {
            name: 'description',
            caption: 'Описание',
            isEditable: true,
            editorOptions: {
                minLines: 3,
                readOnly: true
            },
            'Раздел@': true,
            Раздел: null,
            editorClass: 'controls-demo-pg-text-editor',
            group: 'text',
            type: 'text'
        },
        {
            name: 'tileView',
            isEditable: false,
            caption: 'Список плиткой',
            'Раздел@': true,
            Раздел: null,
            group: 'boolean'
        }
    ],
    keyProperty: 'name'
});

const hierarchyCollection = new PropertyGridCollection<Model>({
    collection: hierarchySource,
    editingObject,
    parentProperty: 'Раздел',
    nodeProperty: 'Раздел@',
    keyProperty: PROPERTY_NAME_FIELD,
    root: null
});

describe('Controls/propertyGrid:CollectionItem', () => {
    describe('getEditorTemplateName', () => {
        it('returns template by type', () => {
            const template = collection.getItemBySourceIndex(0).getEditorTemplateName();
            assert.equal(template, DEFAULT_EDITORS.text);
        });

        it('returns template from editorTemplateName property', () => {
            const template = collection.getItemBySourceKey('customEditor').getEditorTemplateName();
            assert.equal(template, 'editorTemplate');
        });

        it('node items contains only caption without editor', () => {
            const node = hierarchyCollection.getItemBySourceKey('tileView');
            assert.isNull(node.getEditorTemplateName());
        });
    });

    describe('getValidateTemplateName', () => {
        it('returns default validator', () => {
            const template = collection.getItemBySourceKey('videoSource').getValidateTemplateName();
            assert.equal(template, DEFAULT_VALIDATOR_TEMPLATE);
        });

        it('returns default validator by property type', () => {
            const template = collection.getItemBySourceKey('validate').getValidateTemplateName();
            assert.equal(template, DEFAULT_VALIDATORS_BY_TYPE.text);
        });

        it('returns validator from validateTemplateName property', () => {
            const template = collection.getItemBySourceKey('customValidateTemplate').getValidateTemplateName();
            assert.equal(template, 'validateTemplate');
        });
    });

    describe('getEditorOptions', () => {
        it('item not contains propertyValue in options', () => {
            const editorOptions = collection.getItemBySourceKey('description').getEditorOptions();
            assert.equal(editorOptions.minLines, 3);
            assert.equal(editorOptions.propertyValue, undefined);
        });
    });

    describe('getPropertyValue', () => {
        it('returns value from editingObject', () => {
            const propertyValue = collection.getItemBySourceKey('description').getPropertyValue();
            assert.equal(propertyValue, 'This is http://mysite.com');
        });
    });

    describe('getEditorReadOnly', () => {
        it('returns readOnly from editorOptions', () => {
            const readOnly = collection.getItemBySourceIndex(0).getEditorReadOnly(false);
            assert.isTrue(readOnly);
        });

        it('returns readOnly from arguments', () => {
            const readOnly = collection.getItemBySourceIndex(1).getEditorReadOnly(false);
            assert.isFalse(readOnly);
        });
    });

    describe('getEditorClasses', () => {
        it('returns editorClasses from item', () => {
            const classes = collection.getItemBySourceIndex(0).getEditorClasses();
            assert.ok(classes ===  source.at(0).get('editorClass'));
        });

        it('returns editorClasses from item and without caption class', () => {
            const classes = collection.getItemBySourceKey('function').getEditorClasses();
            assert.ok(classes ===  (source.at(0).get('editorClass') + ' controls-PropertyGrid__editor-withoutCaption'));
        });
    });

    describe('getItemPaddingClasses', () => {
        it('returns padding classes for editor with jumpingLabel', () => {
            const classes = collection.getItemBySourceKey('function').getItemPaddingClasses(2);
            assert.ok(classes.indexOf('controls-PropertyGrid__editor_spacingLeft_default') !== -1);
        });
    });

    describe('isEditable', () => {
        it('editable flat item', () => {
            const item = collection.getItemBySourceKey('description');
            assert.isTrue(item.isEditable());
        });

        it('not editable flat item', () => {
            const item = collection.getItemBySourceKey('tileView');
            assert.isFalse(item.isEditable());
        });

        it('groups is not editable', () => {
            let isEditable;
            collection.getViewIterator().each((collectionItem) => {
                if (collectionItem['[Controls/_display/GroupItem]']) {
                    isEditable = collectionItem.isEditable();
                }
            });
            assert.isFalse(!!isEditable);
        });

        it('Node item is editable', () => {
            const node = hierarchyCollection.getItemBySourceKey('description');
            assert.isTrue(node.isNode());
            assert.isTrue(node.isEditable());
        });
    });
});
