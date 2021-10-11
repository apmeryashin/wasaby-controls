import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnScroll/DevelopmentFull/demoLayout/demoLayout';

export interface IOptions extends IControlOptions {
    leftSidebarBlocks?: Array<{
        template: TemplateFunction
    }>;
    rightSidebarBlocks?: Array<{
        template: TemplateFunction
    }>;
}

export default class extends Control<IOptions> {
    protected _template: TemplateFunction = Template;

    private _isLeftSidebarOpened = true;
    private _isRightSidrbarOpened = true;

    private _toggleSidebar(_, side: 'left' | 'right'): void {
        if (side === 'left' && this._options.leftSidebarBlocks && this._options.leftSidebarBlocks.length) {
            this._isLeftSidebarOpened = !this._isLeftSidebarOpened;
        } else if (side === 'right' && this._options.rightSidebarBlocks && this._options.rightSidebarBlocks.length) {
            this._isRightSidrbarOpened = !this._isRightSidrbarOpened;
        }
    }

    static _styles: string[] = ['Controls-demo/gridNew/ColumnScroll/DevelopmentFull/demoLayout/demoLayout'];
}
