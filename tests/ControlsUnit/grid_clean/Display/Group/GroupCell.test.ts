import { assert } from 'chai';

import { Model } from 'Types/entity';
import { IColumn } from 'Controls/grid';

import {
    GridGroupCell as GroupCell,
    GridGroupRow as GroupItem
} from 'Controls/grid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/grid/Display/Group/GroupCell', () => {
    let column: IColumn;
    let hasMultiSelectColumn: boolean;

    function getGroupCell(): GroupCell<Model> {
        const owner = {
            hasMultiSelectColumn: () => hasMultiSelectColumn,
            getGroupPaddingClasses: () => 'controls-ListView__groupContent__rightPadding_s'
        } as undefined as GroupItem<Model>;
        return new GroupCell({
            contents: {},
            columnsLength: 4,
            column,
            owner
        });
    }

    beforeEach(() => {
        hasMultiSelectColumn = false;
        column = { width: '150' };
    });

    describe('shouldDisplayLeftSeparator', () => {
        it('should return false when textAlign === \'left\'', () => {
            const result = getGroupCell().shouldDisplayLeftSeparator(true, undefined, 'left');
            assert.isFalse(result);
        });

        it('should return true when textAlign !== \'left\'', () => {
            const result = getGroupCell().shouldDisplayLeftSeparator(true, undefined, 'right');
            assert.isTrue(result);
        });

        it('should not return true when textVisible === false', () => {
            const result = getGroupCell().shouldDisplayLeftSeparator(true, false, 'right');
            assert.isFalse(result);
        });

        it('should not return true when separatorVisibility === false', () => {
            const result = getGroupCell().shouldDisplayLeftSeparator(false, undefined, 'right');
            assert.isFalse(result);
        });
    });

    describe('shouldDisplayRightSeparator', () => {
        it('should return true when textVisible === false and textAlign === \'right\'', () => {
            const result = getGroupCell().shouldDisplayRightSeparator(true, false, 'right');
            assert.isTrue(result);
        });

        it('should return true when textVisible !== false', () => {
            const result = getGroupCell().shouldDisplayRightSeparator(true, undefined, 'left');
            assert.isTrue(result);
        });

        it('should return false when textVisible !== false and textAlign === \'right\'', () => {
            const result = getGroupCell().shouldDisplayRightSeparator(true, undefined, 'right');
            assert.isFalse(result);
        });

        it('should return false when separatorVisibility === false', () => {
            const result = getGroupCell().shouldDisplayRightSeparator(false, false, 'left');
            assert.isFalse(result);
        });
    });

    describe('getContentTextClasses', () => {
        it('should contain placeholder class when no separator and textAlign === right', () => {
            const classes = getGroupCell().getContentTextWrapperClasses(undefined,
                undefined, undefined, undefined, false);
            CssClassesAssert.include(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });

        it('should contain placeholder class when no separator', () => {
            const classes = getGroupCell().getContentTextWrapperClasses(undefined,
                undefined, undefined, undefined, false);
            CssClassesAssert.include(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });

        it('should contain align class', () => {
            let classes: string;
            classes = getGroupCell().getContentTextClasses('left');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent_left']);

            classes = getGroupCell().getContentTextClasses('right');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent_right']);

            classes = getGroupCell().getContentTextClasses(undefined);
            CssClassesAssert.include(classes, ['controls-ListView__groupContent_center']);
        });

        it('should NOT contain placeholder class when separator and textAlign === right', () => {
            const classes = getGroupCell().getContentTextWrapperClasses(undefined,
                undefined, undefined, undefined, true);
            CssClassesAssert.notInclude(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });
    });

    describe('getContentTextStylingClasses', () => {
        it('should contain styling classes when styling options are set', () => {
            const classes = getGroupCell().getContentTextStylingClasses('secondary', 's', 'bold', 'uppercase');
            CssClassesAssert.include(classes, [
                'controls-fontsize-s',
                'controls-text-secondary',
                'controls-fontweight-bold',
                'controls-ListView__groupContent_textTransform_uppercase',
                'controls-ListView__groupContent_textTransform_uppercase_s'
            ]);
        });

        it('should contain default styling class when styling options are not set', () => {
            const classes = getGroupCell().getContentTextStylingClasses();
            CssClassesAssert.include(classes, [
                'controls-ListView__groupContent-text_default',
                'controls-ListView__groupContent-text_color_default'
            ]);
            CssClassesAssert.notInclude(classes, [
                'controls-fontweight-bold',
                'controls-ListView__groupContent_textTransform_uppercase',
                'controls-ListView__groupContent_textTransform_uppercase_s'
            ]);
        });
    });
});
