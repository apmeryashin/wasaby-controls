import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operationsPanel/Panel/Cloud/Cloud';
import {Memory} from 'Types/source';
import 'css!Controls/operationsPanel';
import {Container, IDragObject} from 'Controls/dragnDrop';
import 'Controls/menu';
import {SyntheticEvent} from 'UI/Events';

export interface IOperationsPanelCloudOptions extends IControlOptions {
    source: Memory;
}

export default class extends Control<IOperationsPanelCloudOptions> {
    protected _template: TemplateFunction = template;
    protected _dragging: boolean = false;

    protected _children: Record<string, any> = {
        dragNDrop: Container
    };

    protected _onDragEnd(): void {
        this._notify('popupDragEnd', [], {bubbling: true});
    }

    protected _onDragMove(event: SyntheticEvent<Event>, dragObject: IDragObject): void {
        this._dragging = true;
        this._notify('popupDragStart', [dragObject.offset], {bubbling: true});
    }

    protected _onMouseDown(event: SyntheticEvent<MouseEvent>): void {
        this._startDragNDrop(event);
    }

    private _startDragNDrop(event: SyntheticEvent<Event>): void {
        this._children.dragNDrop.startDragNDrop(null, event);
    }

    protected _closePanel(e: SyntheticEvent): void {
        e.stopImmediatePropagation();
        this._notify('close', [], {bubbling: true});
    }

    protected _mouseOut(): void {
        this._dragging = false;
    }

    protected _selectedTypeChanged(event: SyntheticEvent, type: string): void {
        this._notify('sendResult', ['selectedTypeChanged', type], {bubbling: true});
    }

    private _getChangedSelectedType(): string {
        if (this._options.isAllSelected || this._options.selectedKeysCount !== 0) {
            return 'unselectAll';
        }
        return 'selectAll';
    }

    protected _click(): void {
        if (!this._dragging) {
            this._notify('sendResult', ['selectedTypeChanged', this._getChangedSelectedType()], {bubbling: true});
        }
        this._dragging = false;
    }
}
