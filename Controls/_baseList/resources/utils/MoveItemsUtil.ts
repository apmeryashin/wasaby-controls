import { DataSet } from 'Types/source';
import { ISelectionObject } from 'Controls/_interface/ISelectionType';
import {
    IMoveActionOptions as IBaseMoveActionsOptions,
    Move as MoveAction
} from 'Controls/listCommands';
import { Logger } from 'UI/Utils';
import { Control } from 'UI/Base';
import { TBeforeMoveCallback } from 'Controls/_baseList/interface/IMovableList';

interface IMoveDialogTemplate {
    beforeMoveCallback: TBeforeMoveCallback;
    templateName: string;
    templateOptions: object;
}

interface IMoveActionOptions extends IBaseMoveActionsOptions {
    opener: Control;
    moveDialogTemplate: IMoveDialogTemplate;
}

export function moveItemsWithDialog(selection: ISelectionObject, options: IMoveActionOptions): Promise<DataSet|void> {
    return getMoveAction(options).execute({
        selection,
        filter: options.filter
    });
}

function getMoveAction(options: IMoveActionOptions): MoveAction {
    const controllerOptions: IMoveActionOptions = {
        source: options.source,
        parentProperty: options.parentProperty,
        keyProperty: options.keyProperty,
        sorting: options.sorting,
        siblingStrategy: options.siblingStrategy,
        opener: options.opener,
        moveDialogTemplate: null
    };
    if (options.moveDialogTemplate) {
        if (options.moveDialogTemplate.templateName) {
            // opener необходим для корректного закрытия окна перемещения в слое совместимости в стековой панели.
            controllerOptions.popupOptions = {
                opener: options.opener,
                template: options.moveDialogTemplate.templateName,
                templateOptions: options.moveDialogTemplate.templateOptions,
                beforeMoveCallback: options.moveDialogTemplate.beforeMoveCallback
            };
            const templateOptions = controllerOptions.popupOptions.templateOptions;
            if (templateOptions && !templateOptions.keyProperty) {
                templateOptions.keyProperty = options.keyProperty;
            }
        } else {
            Logger.error('Mover: Wrong type of moveDialogTemplate option, use object notation instead of template function');
        }
    }

    return new MoveAction(controllerOptions);
}
