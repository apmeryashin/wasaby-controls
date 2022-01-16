import {loadAsync} from 'WasabyLoader/ModulesLoader';
import {showType} from 'Controls/toolbars';
import {mixin, object} from 'Types/util';
import {
    EventRaisingMixin,
    ObservableMixin
} from 'Types/entity';
import {merge} from 'Types/object';
import {IAction} from './IAction';
import {IExecuteCommandParams, ControllerClass as OperationsController} from 'Controls/operations';
import {ControllerClass as FilterController} from 'Controls/filter';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {IToolBarItem} from 'Controls/toolbars';
import {RecordSet} from 'Types/collection';
import {DataSet} from 'Types/source';
import {IMenuControlOptions} from 'Controls/menu';
import {TKey} from 'Controls/interface';

export interface IBaseAction {
    execute: (options: Partial<IExecuteOptions>) => Promise<unknown>;
}
export interface ICommandOptions {
    [key: string]: any;
}

export interface IViewCommandOptions {
    [key: string]: any;
}

export interface IBaseActionOptions {
    id: string;
    visible: boolean;
    iconStyle: string;
    icon: string;
    commandName?: string;
    commandOptions?: ICommandOptions;
    viewCommandOptions?: IViewCommandOptions;
    viewCommandName?: string;
    order?: number;
    title?: string;
    tooltip?: string;
    showType?: number;
    onExecuteHandler?: Function;
    parent?: string | number;
    permissions?: string[];
    requiredLevel: string[];
}

export interface IExecuteOptions {
    operationsController?: OperationsController;
    filterController?: FilterController;
    sourceController?: SourceController;
    [key: string]: unknown;
}

const TOOLBAR_PROPS = ['icon', 'iconStyle', 'title', 'tooltip', 'visible', 'viewMode', 'parent', 'parent@', 'showType', 'template', 'order'];

export default abstract class BaseAction extends mixin<ObservableMixin>(
    ObservableMixin
) implements IBaseAction {
    protected _options: IBaseActionOptions = null;
    readonly id: string;
    readonly order: number;
    readonly parent: string | number;
    readonly showType: number;
    'parent@': boolean;
    readonly onExecuteHandler: Function;
    commandName: string;
    commandOptions: Record<string, any>;
    viewCommandName: string;
    viewCommandOptions: Record<string, any>;
    private _iconStyle: string;
    private _icon: string;
    private _title: string;
    private _tooltip: string;
    private _visible: boolean;

    protected get icon(): string {
        return this._icon;
    }

    protected set icon(value: string) {
        this._setProperty('_icon', value);
    }

    protected get title(): string {
        return this._title;
    }

    protected set title(value: string) {
        this._setProperty('_title', value);
    }

    protected get tooltip(): string {
        return this._tooltip;
    }

    protected set tooltip(value: string) {
        this._setProperty('_tooltip', value);
    }

    protected get visible(): boolean {
        return this._visible;
    }

    protected set visible(value: boolean) {
        this._setProperty('_visible', value);
    }

    protected get iconStyle(): string {
        return this._iconStyle;
    }

    protected set iconStyle(value: string) {
        this._setProperty('_iconStyle', value);
    }

    constructor(options: IBaseActionOptions) {
        super();
        this._options = options;
        this.icon = options.icon || this.icon;
        this.title = options.title || this.title;
        this.tooltip = options.tooltip || this.tooltip || this.title;
        this.visible = options.hasOwnProperty('visible') ? options.visible as boolean : this.visible;
        this.iconStyle = options.iconStyle || this.iconStyle;
        this.order = options.order || this.order;
        this.onExecuteHandler = options.onExecuteHandler;
        this.commandName = options.commandName || this.commandName;
        this.commandOptions = options.commandOptions || this.commandOptions;
        this.viewCommandName = options.viewCommandName || this.viewCommandName;
        this.viewCommandOptions = options.viewCommandOptions || this.viewCommandOptions;
        this.showType = options.hasOwnProperty('showType') ? options.showType : this.showType;
        this.parent = options.parent || this.parent;
        this.id = options.id || this.id;
        this['parent@'] = options['parent@'] || this['parent@'];

        EventRaisingMixin.call(this, options);
    }

    execute(options: Partial<IExecuteOptions>): Promise<unknown> | void {
        return this._executeCommand(options);
    }

    getChildren(root: number | string): Promise<RecordSet | DataSet> | void {
        // for override
    }

    getValue(): TKey | TKey[] {
        return undefined;
    }

    private _executeCommand(options): Promise<unknown> | void {
        if (this.commandName) {
            const commandOptions = this._getCommandOptions(options);
            return this._createCommand(commandOptions, this.commandName).then((commandClass) => {
                if (this.viewCommandName) {
                    return this._createCommand({
                            ...commandOptions,
                            command: commandClass,
                            sourceController: options.sourceController,
                            ...this.viewCommandOptions
                        },
                        this.viewCommandName).then((viewCommandClass) => {
                        return this._actionExecute(commandOptions, viewCommandClass);
                    });
                } else {
                    return this._actionExecute(commandOptions, commandClass);
                }
            });
        } else if (this.onExecuteHandler) {
            if (typeof this.onExecuteHandler === 'string') {
                return loadAsync(this.onExecuteHandler).then((handler: Function) => {
                    handler(this._getCommandOptions(options));
                });
            } else {
                return this.onExecuteHandler(this._getCommandOptions(options));
            }
        }
    }

    private _getCommandOptions(commandParams: Partial<IExecuteCommandParams> = {}): object {
        const commandOptions = object.clone(this.commandOptions) || {};
        merge(commandOptions, {
            source: commandParams.sourceController.getSource(),
            filter: commandParams.sourceController.getFilter(),
            keyProperty: commandParams.sourceController.getKeyProperty(),
            parentProperty: commandParams.sourceController.getParentProperty(),
            nodeProperty: commandParams.nodeProperty,
            navigation: commandParams.navigation,
            selection: commandParams.selection,
            sourceController: commandParams.sourceController,
            operationsController: commandParams.operationsController,
            selectedKeysCount: commandParams.selectedKeysCount,
            target: commandParams.target,
            toolbarItem: commandParams.toolbarItem
        });
        return commandOptions;
    }

    private _createCommand(commandOptions, commandName: string): Promise<IAction> {
        return loadAsync(commandName).then((command) => {
            return new command(commandOptions);
        });
    }

    protected _actionExecute(commandOptions, command): Promise<void> {
        return command.execute(commandOptions);
    }

    getMenuOptions(): Partial<IMenuControlOptions> {
        return {};
    }

    getState(): IToolBarItem {
        const config: IToolBarItem = {id: this.id};
        const menuOptions = this.getMenuOptions();
        TOOLBAR_PROPS.forEach((prop) => {
            config[prop] = this[prop];
        });
        const value = this.getValue();
        if (value !== undefined) {
            menuOptions.selectedKeys = value instanceof Array ? value : [value];
        }
        config.menuOptions = menuOptions;
        return config;
    }

    private _setProperty(prop: string, value: unknown): void {
        if (this[prop] !== value) {
            this[prop] = value;
            this._notify('itemChanged', this.getState());
        }
    }
}

Object.assign(BaseAction.prototype, {
    visible: true,
    'parent@': false,
    showType: showType.MENU_TOOLBAR,
    parent: null
});
