import { assert } from 'chai';
import {RecordSet} from 'Types/collection';
import {Collection, CollectionItem} from 'Controls/display';
import {ICollection} from '../../../Controls/_display/interface/ICollection';
import { CssClassesAssert } from 'ControlsUnit/CustomAsserts';
import {Model} from 'Types/entity';

interface IChangedData<T> {
    item?: CollectionItem<T>;
    property?: string;
}

describe('Controls/_display/CollectionItem', () => {
    describe('.getOwner()', () => {
        it('should return null by default', () => {
            const item = new CollectionItem();
            assert.isNull(item.getOwner());
        });

        it('should return value passed to the constructor', () => {
            const owner = {};
            const item = new CollectionItem({owner: owner as any});

            assert.strictEqual(item.getOwner(), owner);
        });
    });

    describe('.setOwner()', () => {
        it('should set the new value', () => {
            const owner = {};
            const item = new CollectionItem();

            item.setOwner(owner as any);

            assert.strictEqual(item.getOwner(), owner);
        });
    });

    describe('.getContents()', () => {
        it('should return null by default', () => {
            const item = new CollectionItem();
            assert.isNull(item.getContents());
        });

        it('should return value passed to the constructor', () => {
            const contents = {};
            const item = new CollectionItem({contents});

            assert.strictEqual(item.getContents(), contents);
        });
    });

    describe('.setContents()', () => {
        it('should set the new value', () => {
            const contents = {};
            const item = new CollectionItem();

            item.setContents(contents);

            assert.strictEqual(item.getContents(), contents);
        });

        it('should notify the owner', () => {
            const newContents = 'new';
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };
            const item = new CollectionItem({owner: owner as any});

            item.setContents(newContents);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'contents');
        });

        it('should not notify the owner', () => {
            const newContents = 'new';
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };
            const item = new CollectionItem({owner: owner as any});

            item.setContents(newContents, true);

            assert.isUndefined(given.item);
            assert.isUndefined(given.property);
        });
    });

    describe('.getUid()', () => {
        it('should return calling result of getItemUid() on owner', () => {
            const owner = {
                getItemUid: (item) => `[${item.getContents()}]`
            };
            const item = new CollectionItem({
                owner: owner as any,
                contents: 'foo'
            });

            assert.equal(item.getUid(), '[foo]');
        });

        it('should return undefined if there is no owner', () => {
            const item = new CollectionItem();
            assert.isUndefined(item.getUid());
        });
    });

    describe('.isSelected()', () => {
        it('should return false by default', () => {
            const item = new CollectionItem();
            assert.isFalse(item.isSelected());
        });

        it('should return value passed to the constructor', () => {
            const selected = true;
            const item = new CollectionItem({selected});

            assert.strictEqual(item.isSelected(), selected);
        });
    });

    describe('.setSelected()', () => {
        it('should set the new value', () => {
            const selected = true;
            const item = new CollectionItem();

            item.setSelected(selected);

            assert.strictEqual(item.isSelected(), selected);
        });

        it('should notify the owner', () => {
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };

            const item = new CollectionItem({owner: owner as any});
            item.setSelected(true);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'selected');
        });

        it('should not notify the owner', () => {
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };

            const item = new CollectionItem({owner: owner as any});
            item.setSelected(true, true);

            assert.isUndefined(given.item);
            assert.isUndefined(given.property);
        });
    });

    describe('.toJSON()', () => {
        it('should serialize the collection item', () => {
            const item = new CollectionItem();
            const json = item.toJSON();
            const options = (item as any)._getOptions();

            delete options.owner;

            assert.strictEqual(json.module, 'Controls/display:CollectionItem');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
            assert.deepEqual(json.state.$options, options);
            assert.strictEqual((json.state as any).iid, item.getInstanceId());
        });

        it('should serialize contents of the item if owner is not defined', () => {
            const items = [1];
            (items as any).getIndex = Array.prototype.indexOf;
            const owner = {
                getCollection(): number[] {
                    return items;
                }
            };

            const item = new CollectionItem({
                owner: owner as any,
                contents: 'foo'
            });
            const json = item.toJSON();

            assert.isUndefined((json.state as any).ci);
            assert.equal(json.state.$options.contents, 'foo');
        });

        it('should serialize contents of the item if owner doesn\'t supports IList', () => {
            const items = [1];
            const owner = {
                getCollection(): number[] {
                    return items;
                }
            };

            const item = new CollectionItem({
                owner: owner as any,
                contents: 'foo'
            });
            const json = item.toJSON();

            assert.isUndefined((json.state as any).ci);
            assert.equal(json.state.$options.contents, 'foo');
        });

        it('should don\'t serialize contents of the item if owner supports IList', () => {
            const items = [1];
            const owner = {
                getCollection(): number[] {
                    return items;
                }
            };
            items['[Types/_collection/IList]'] = true;
            (items as any).getIndex = Array.prototype.indexOf;

            const item = new CollectionItem({
                owner: owner as any,
                contents: items[0]
            });
            const json = item.toJSON();

            assert.strictEqual((json.state as any).ci, 0);
            assert.isUndefined(json.state.$options.contents);
        });
    });

    it('.getDisplayProperty()', () => {
        const owner = {
            getDisplayProperty(): string {
                return 'myDisplayProperty';
            }
        };

        const item = new CollectionItem({ owner });

        assert.strictEqual(item.getDisplayProperty(), 'myDisplayProperty');
    });

    it('.setMarked()', () => {
        const given: IChangedData<string> = {};
        const owner = {
            notifyItemChange(item: CollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            }
        };

        const item = new CollectionItem({ owner });
        assert.isFalse(item.isMarked());

        const prevVersion = item.getVersion();

        item.setMarked(true);
        assert.isTrue(item.isMarked());
        assert.isAbove(item.getVersion(), prevVersion);

        assert.strictEqual(given.item, item);
        assert.strictEqual(given.property, 'marked');
    });

    describe('actions', () => {
        let given: IChangedData<string>;
        const owner = {
            getEditingConfig(): object {
                return {
                    toolbarVisibility: true
                };
            },
            notifyItemChange(item: CollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            }
        };

        beforeEach(() => {
            given = {};
        });

        it('.setActions()', () => {
            const item = new CollectionItem({ owner });
            const actions = {};
            const prevVersion = item.getVersion();

            item.setActions(actions);

            assert.strictEqual(item.getActions(), actions);
            assert.isAbove(item.getVersion(), prevVersion);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'actions');
        });

        it('.hasVisibleActions()', () => {
            const item = new CollectionItem({ owner });
            const actions = {
                all: [{ id: 1 }, { id: 2 }, { id: 3 }],
                showed: []
            };

            item.setActions(actions);
            assert.isFalse(item.hasVisibleActions());

            const newActions = {
                ...actions,
                showed: [{ id: 1 }]
            };

            item.setActions(newActions);
            assert.isTrue(item.hasVisibleActions());
        });

        it('.hasActionWithIcon()', () => {
            const item = new CollectionItem({ owner });
            const actions = {
                all: [{ id: 1 }, { id: 2 }, { id: 3 }],
                showed: []
            };

            item.setActions(actions);
            assert.isFalse(item.hasActionWithIcon());

            const newActions = {
                ...actions,
                showed: [{ id: 1 }]
            };

            item.setActions(newActions);
            assert.isFalse(item.hasActionWithIcon());

            const actionsWithIcon = {
                ...newActions,
                showed: [...newActions.showed, { id: 2, icon: 'phone' }]
            };

            item.setActions(actionsWithIcon);
            assert.isTrue(item.hasActionWithIcon());
        });

        describe('.shouldDisplayActions()', () => {
            it('displays actions when there are showed actions', () => {
                const item = new CollectionItem({ owner });
                const actions = {
                    all: [{ id: 1 }, { id: 2 }, { id: 3 }],
                    showed: []
                };

                item.setActions(actions);
                assert.isFalse(item.shouldDisplayActions());

                // has showed actions
                const newActions = {
                    ...actions,
                    showed: [{ id: 1 }]
                };

                item.setActions(newActions);
                assert.isTrue(item.shouldDisplayActions());
            });

            it('displays actions in edit mode (toolbar)', () => {
                const item = new CollectionItem({ owner });
                const actions = {
                    all: [{ id: 1 }, { id: 2 }, { id: 3 }],
                    showed: []
                };

                // has no showed actions, but is editing
                item.setActions(actions);
                item.setEditing(true);

                assert.isTrue(item.shouldDisplayActions());
            });
        });
    });

    describe('isSwiped variants', () => {
        let given: IChangedData<string>;
        let owner: ICollection<any, CollectionItem<any>>;
        let item: CollectionItem<any>;
        beforeEach(() => {
            given = {};
            owner = {
                _swipeAnimation: null,
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                },
                getSwipeAnimation() {
                    return this._swipeAnimation;
                },
                setSwipeAnimation(animation) {
                    this._swipeAnimation = animation;
                }
            };
            item = new CollectionItem({ owner });
        });

        // Версия должна измениться после setSwiped()
        it('should update item\'s version on setSwiped()', () => {
            const prevVersion = item.getVersion();
            item.setSwiped(true);
            assert.isAbove(item.getVersion(), prevVersion);
        });

        // Модельдолжна сообщить корректное событие после setSwiped()
        it('should fire change event on setSwiped()', () => {
            item.setSwiped(true);
            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'swiped');
        });

        // isSwiped() должен вернуть true, тогда и только тогда когда анимация выставлена в close/open
        it('isSwiped() should only be true when item is swiped', () => {
            item.setSwiped(true);
            assert.isFalse(!!item.isAnimatedForSelection(), 'Item cannot be right-swiped when animation was set to open/close');
            assert.isTrue(!!item.isSwiped(), 'Item should be left-swiped when animation was set to open/close');
        });

        // isAnimatedForSelection() должен вернуть true, тогда и только тогда когда анимация выставлена в right-swipe
        it('isAnimatedForSelection() should only be true when item is right-swiped', () => {
            item.setAnimatedForSelection(true);
            assert.isTrue(!!item.isAnimatedForSelection(), 'Item should be right-swiped when animation was set to right-swipe');
            assert.isFalse(!!item.isSwiped(), 'Item cannot be left-swiped when animation was set to right-swipe');
        });
    });

    it('.setActive()', () => {
        const given: IChangedData<string> = {};
        const owner = {
            notifyItemChange(item: CollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            },
            getHoverBackgroundStyle() {/* FIXME: sinon mock */}
        };

        const item = new CollectionItem({ owner });
        assert.isFalse(item.isActive());

        const prevVersion = item.getVersion();

        item.setActive(true);
        assert.isTrue(item.isActive());
        assert.isAbove(item.getVersion(), prevVersion);

        assert.strictEqual(given.item, item);
        assert.strictEqual(given.property, 'active');
    });

    it('.getWrapperClasses()', () => {
        const owner = {
            notifyItemChange(): void {/* FIXME: sinon mock */},
            getHoverBackgroundStyle() {/* FIXME: sinon mock */},
            getEditingBackgroundStyle: () => 'default',
            isFirstItem: () => false,
            isLastItem: () => false,
            getNavigation: () => ({})
        };

        const defaultClasses = [
            'controls-ListView__itemV',
            'controls-ListView__item_default',
            'controls-ListView__item_showActions',
            'js-controls-ListView__measurableContainer'
        ];
        const editingClasses = [
            'controls-ListView__item_background-editing'
        ];

        const item = new CollectionItem({ owner });
        const wrapperClasses = item.getWrapperClasses();

        defaultClasses.forEach((className) => assert.include(wrapperClasses, className));
        editingClasses.forEach((className) => assert.notInclude(wrapperClasses, className));

        item.setEditing(true, true);
        const editingWrapperClasses = item.getWrapperClasses();

        defaultClasses.concat(editingClasses).forEach((className) => assert.include(editingWrapperClasses, className));
    });

    it('.getContentClasses()', () => {
        const owner = {
            getTopPadding(): string { return '#topSpacing#'; },
            getBottomPadding(): string { return '#bottomSpacing#'; },
            getLeftPadding(): string { return '#leftSpacing#'; },
            getRightPadding(): string { return '#rightSpacing#'; },
            getMultiSelectVisibility: () => undefined,
            getMultiSelectPosition(): string { return 'default'; },
            getRowSeparatorSize() { return ''; },
            isLastItem() { return false; },
            getNavigation() { return {
                view: 'page'
            }; }
        };
        const defaultClasses = [
            'controls-ListView__itemContent',
            'controls-ListView__item_default-topPadding_#topspacing#',
            'controls-ListView__item_default-bottomPadding_#bottomspacing#',
            'controls-ListView__item-rightPadding_#rightspacing#'
        ];

        const item = new CollectionItem({ owner, multiSelectVisibility: 'visible' });

        // multiselect visible
        const visibleContentClasses = item.getContentClasses();
        defaultClasses.concat([
            'controls-ListView__itemContent_withCheckboxes'
        ]).forEach((className) => assert.include(visibleContentClasses, className));

        // multiselect hidden
        item.setMultiSelectVisibility('hidden');
        const hiddenContentClasses = item.getContentClasses();
        defaultClasses.concat([
            'controls-ListView__item-leftPadding_#leftspacing#'
        ]).forEach((className) => assert.include(hiddenContentClasses, className));
    });

    it('.getMultiSelectClasses()', () => {
        const owner = {
            getMultiSelectPosition(): string { return 'default'; }
        };

        const item = new CollectionItem({ owner, multiSelectVisibility: 'onhover' });
        const requiredClasses = 'js-controls-ListView__notEditable ' +
                                'js-controls-ListView__checkbox ' +
                                'js-controls-DragScroll__notDraggable ' +
                                'controls-List_DragNDrop__notDraggable ' +
                                'controls-ListView__checkbox ' +
                                'controls-CheckboxMarker_inList';

        // multiselect onhover + not selected
        item.setMultiSelectVisibility('onhover');
        const onhoverMultiSelectClasses = item.getMultiSelectClasses('default');
        CssClassesAssert.isSame(onhoverMultiSelectClasses, requiredClasses +
            ' controls-ListView__checkbox_marginTop_s controls-ListView__checkbox_position-default' +
            ' controls-ListView__checkbox-onhover');

        // multiselect onhover + selected
        item.setSelected(true, true);
        const selectedMultiSelectClasses = item.getMultiSelectClasses('default');
        CssClassesAssert.isSame(selectedMultiSelectClasses, requiredClasses +
            ' controls-ListView__checkbox_marginTop_s controls-ListView__checkbox_position-default');

        // custom position
        owner.getMultiSelectPosition = () => 'custom';
        const customMultiSelectClasses = item.getMultiSelectClasses('default');
        CssClassesAssert.isSame(customMultiSelectClasses, requiredClasses +
            ' controls-ListView__checkbox_position-custom ');
    });

    describe('.setEditing()', () => {
        it('sets the editing flag and updates the version', () => {
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };

            const item = new CollectionItem({ owner });
            assert.isFalse(item.isEditing());

            const prevVersion = item.getVersion();

            item.setEditing(true);
            assert.isTrue(item.isEditing());
            assert.isAbove(item.getVersion(), prevVersion);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'editing');
        });

        it('should apply all versions update after cancel editing', () => {
            const contents = new Model({
                keyProperty: 'id',
                rawData: { id: 1, title: '' }
            });
            const item = new CollectionItem({ contents });

            assert.equal(item.getVersion(), 0);
            item.setEditing(true, contents);
            assert.equal(item.getVersion(), 1);

            contents.set('title', '1'); // +2
            contents.set('title', '12'); // +2
            contents.set('title', '123'); // +2

            assert.equal(item.getVersion(), 7);

            item.setEditing(false);

            assert.equal(item.getVersion(), 8);
        });

        it('returns the editing contents as the contents in edit mode', () => {
            const originalContents = { id: 1, _original: true };
            const editingContents = { id: 1, _editing: true };

            const item = new CollectionItem({ contents: originalContents });
            item.setEditing(true, editingContents, true);

            assert.strictEqual(item.getContents(), editingContents);

            item.setEditing(false, null, true);

            assert.strictEqual(item.getContents(), originalContents);
        });

        it('notifies owner when editing contents change', () => {
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };
            const editingContents = {
                '[Types/_entity/ObservableMixin]': true,
                id: 1,
                _editing: true,
                _propertyChangedHandler: null,
                subscribe(eventName, handler): void {
                    if (eventName === 'onPropertyChange') {
                        this._propertyChangedHandler = handler;
                    }
                }
            };

            const item = new CollectionItem({ owner });
            item.setEditing(true, editingContents);

            assert.isFunction(editingContents._propertyChangedHandler);

            // emulate property changing and onPropertyChange firing
            editingContents._propertyChangedHandler.call(item);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'editingContents');
        });

        it('unsubscribes from editing contents property change when editing is finished', () => {
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };
            const editingContents = {
                '[Types/_entity/ObservableMixin]': true,
                id: 1,
                _editing: true,
                _propertyChangedHandler: null,
                subscribe(eventName, handler): void {
                    if (eventName === 'onPropertyChange') {
                        this._propertyChangedHandler = handler;
                    }
                },
                unsubscribe(eventName, handler): void {
                    if (eventName === 'onPropertyChange' && this._propertyChangedHandler === handler) {
                        this._propertyChangedHandler = null;
                    }
                }
            };

            const item = new CollectionItem({ owner });
            item.setEditing(true, editingContents);
            item.setEditing(false);

            assert.isNull(editingContents._propertyChangedHandler);
        });

        it('increases item version when editing contents version is increased', () => {
            const editingContents = {
                _version: 0,
                getVersion(): number {
                    return this._version;
                }
            };

            const item = new CollectionItem();
            item.setEditing(true, editingContents, true);

            const prevVersion = item.getVersion();
            editingContents._version++;

            assert.isAbove(item.getVersion(), prevVersion);
        });

        it('show checkbox for editing item', () => {
            const editingItem = new CollectionItem({
                editing: true
            });
            assert.isTrue(editingItem.isVisibleCheckbox());
        });

        it('hide checkbox for adding item', () => {
            const addingItem = new CollectionItem({isAdd: true});
            assert.isFalse(addingItem.isVisibleCheckbox());
        });
    });

    describe('testing of ICollectionItemStyled styling methods', () => {
        let item: CollectionItem<any>;

        beforeEach(() => {
            item = new CollectionItem();
            item.setOwner(new Collection({
                keyProperty: 'id',
                collection: new RecordSet({
                    rawData: [item],
                    keyProperty: 'id'
                }) as any
            }));
        });

        // CSS класс для позиционирования опций записи.

        // Если itemPadding.top === null и itemPadding.bottom === null, то возвращает пустую строку (старая модель)
        // tslint:disable-next-line:max-line-length
        it('getItemActionPositionClasses() should return empty string when itemPadding = {top: null, bottom: null}', () => {
            const result = item.getItemActionPositionClasses('inside', null, {top: 'null', bottom: 'null'}, 'default');
            assert.equal(result, ' controls-itemActionsV_position_bottomRight ');
        });

        // Если itemPadding.top === null и itemPadding.bottom === null, то возвращает пустую строку (новая модель)
        // tslint:disable-next-line:max-line-length
        it('getItemActionPositionClasses() should return empty string when itemPadding = {top: null, bottom: null}', () => {
            item.getOwner().setItemPadding({top: 'null', bottom: 'null'});
            const result = item.getItemActionPositionClasses('inside', null, undefined, 'default');
            assert.equal(result, ' controls-itemActionsV_position_bottomRight ');
        });

        // Если опции внутри строки и itemActionsClass не задан, возвращает класс, добавляющий выравнивание bottomRight
        it('getItemActionPositionClasses() should return classes for bottom-right positioning when itemActionClass is not set', () => {
            const result = item.getItemActionPositionClasses('inside', null, {top: 'null', bottom: 's'}, 'default');
            assert.equal(result, ' controls-itemActionsV_position_bottomRight controls-itemActionsV_padding-bottom_default ');
        });

        // tslint:disable-next-line:max-line-length
        // Если опции внутри строки и itemActionsClass задан, возвращает класс, добавляющий выравнивание согласно itemActionsClass и itemPadding
        it('getItemActionPositionClasses() should return classes for bottom-right positioning when itemActionClass is set', () => {
            const result = item.getItemActionPositionClasses('inside', 'controls-itemActionsV_position_topRight', {top: 'null', bottom: 's'}, 'default');
            assert.equal(result, ' controls-itemActionsV_position_topRight controls-itemActionsV_padding-top_null ');
        });

        // Если новая модель, то в любом случае не считается класс, добавляющий padding
        it('getItemActionPositionClasses() should not add padding class', () => {
            const result = item.getItemActionPositionClasses('inside', null, {top: 's', bottom: 's'}, 'default', true);
            assert.equal(result, ' controls-itemActionsV_position_bottomRight controls-itemActionsV_padding-bottom_default ');
        });

        describe('.getEditorViewTemplateClasses()', () => {
            it('base classes', () => {
                CssClassesAssert.include(item.getEditorViewTemplateClasses(), [
                    'controls-EditingTemplateText',
                    'controls-EditingTemplateText_border-partial',
                    'controls-EditingTemplateText_size_default',
                    'controls-EditingTemplateText_style_default'
                ]);
            });

            it('padding class for different modes', () => {
                it('no editing config', () => {
                    CssClassesAssert.include(item.getEditorViewTemplateClasses(), 'controls-EditingTemplateText_withPadding');
                });
                it('no editing config, but need padding', () => {
                    CssClassesAssert.include(item.getEditorViewTemplateClasses({ withPadding: true }), 'controls-EditingTemplateText_withPadding');
                });
                it('default editing mode', () => {
                    item.getOwner().setEditingConfig({mode: undefined});
                    CssClassesAssert.include(item.getEditorViewTemplateClasses(), 'controls-EditingTemplateText_withPadding');
                });
                it('row editing mode', () => {
                    item.getOwner().setEditingConfig({mode: 'row'});
                    CssClassesAssert.include(item.getEditorViewTemplateClasses(), 'controls-EditingTemplateText_withPadding');
                });
                it('cell editing mode', () => {
                    item.getOwner().setEditingConfig({mode: 'cell'});
                    CssClassesAssert.notInclude(item.getEditorViewTemplateClasses(), 'controls-EditingTemplateText_withPadding');
                });
            });

            it('hover classes for input', () => {
                CssClassesAssert.notInclude(
                    item.getEditorViewTemplateClasses(),
                    'controls-EditingTemplateText_enabled'
                );
                CssClassesAssert.notInclude(item.getEditorViewTemplateClasses({}), 'controls-EditingTemplateText_enabled');
                CssClassesAssert.notInclude(item.getEditorViewTemplateClasses({enabled: false}), 'controls-EditingTemplateText_enabled');
                CssClassesAssert.include(item.getEditorViewTemplateClasses({enabled: true}), 'controls-EditingTemplateText_enabled');
            });
        });
    });

    it('.getSearchValue()', () => {
        const item = new CollectionItem({searchValue: 'abc'});
        assert.equal(item.getSearchValue(), 'abc');

        item.setSearchValue('123');
        assert.equal(item.getSearchValue(), '123');
    });

    it('shadowVisibility', () => {
        let item = new CollectionItem({hasMoreDataUp: false, isFirstStickedItem: false});
        assert.equal(item.getShadowVisibility(), 'lastVisible');

        item = new CollectionItem({hasMoreDataUp: true, isFirstStickedItem: false});
        assert.equal(item.getShadowVisibility(), 'lastVisible');

        item = new CollectionItem({hasMoreDataUp: false, isFirstStickedItem: true});
        assert.equal(item.getShadowVisibility(), 'lastVisible');

        item = new CollectionItem({hasMoreDataUp: true, isFirstStickedItem: true});
        assert.equal(item.getShadowVisibility(), 'initial');
    });
});
