import {IToolBarItem} from 'Controls/toolbars';
import {ICommandOptions} from 'Controls/listCommands';

export interface IAction extends IToolBarItem {
    order?: number;
    onExecuteHandler?: Function;
    actionName?: string;
    commandName?: string;
    commandOptions?: ICommandOptions;
    viewCommandName?: string;
    viewCommandOptions?: unknown;
    permissions?: string[];
    permissionsLevel?: number;
    requiredLevel?: string;
    visible?: boolean;
    prefetchResultId?: string;
}
