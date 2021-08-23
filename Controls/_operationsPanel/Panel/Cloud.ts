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
    protected _children: Record<string, any> = {
        dragNDrop: Container
    };

    protected _onDragEnd(): void {
        this._notify('popupDragEnd', [], {bubbling: true});
    }

    protected _onDragMove(event: SyntheticEvent<Event>, dragObject: IDragObject): void {
        this._notify('popupDragStart', [dragObject.offset], {bubbling: true});
    }

    protected _onMouseDown(event: SyntheticEvent<MouseEvent>): void {
        this._startDragNDrop(event);
    }

    private _startDragNDrop(event: SyntheticEvent<Event>): void {
        this._children.dragNDrop.startDragNDrop(null, event);
    }

    protected _closePanel(): void {
        this._notify('close', [], {bubbling: true});
    }
}
