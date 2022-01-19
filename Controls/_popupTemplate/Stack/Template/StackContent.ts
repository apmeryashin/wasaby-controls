import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Stack/Template/StackContent/StackContent';
import {EventUtils} from 'UI/Events';

interface IStackContentOptions extends IControlOptions {
    stackMaxWidth?: number;
    stackMinWidth?: number;
    stackWidth?: number;
}

class StackContent extends Control<IStackContentOptions> {
    protected _template: TemplateFunction = template;
    protected _tmplNotify: Function = EventUtils.tmplNotify;
    protected _minOffset: number;
    protected _maxOffset: number;
    protected _beforeMount(options: IStackContentOptions): void {
        this._updateOffset(options);
    }

    protected _beforeUpdate(options: IStackContentOptions): void {
        this._updateOffset(options);
    }

    protected _canResize(propStorageId: string, width: number, minWidth: number, maxWidth: number): boolean {
        const canResize = propStorageId && width && minWidth && maxWidth && maxWidth !== minWidth;
        return !!canResize;
    }

    private _updateOffset(options: IStackContentOptions): void {
        // protect against wrong options
        this._maxOffset = Math.max(options.stackMaxWidth - options.stackWidth, 0);
        this._minOffset = Math.max(options.stackWidth - options.stackMinWidth, 0);
    }

}
export default StackContent;
