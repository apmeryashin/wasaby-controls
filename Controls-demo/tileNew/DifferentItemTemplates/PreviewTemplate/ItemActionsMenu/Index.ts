import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/PreviewTemplate/ItemActionsMenu/Template';
import {HierarchicalMemory} from 'Types/source';
import {Gadgets} from 'Controls-demo/tileNew/DataHelpers/DataCatalog';
import {TItemActionShowType} from 'Controls/itemActions';


const DATA = Gadgets.getPreviewItems();

const ACTIONS = [
    {
        id: 1,
        icon: 'icon-DownloadNew',
        title: 'download',
        showType: TItemActionShowType.MENU
    },
    {
        id: 11,
        icon: 'icon-Erase',
        iconStyle: 'danger',
        title: 'remove',
        showType: TItemActionShowType.FIXED
    },
    {
        id: 2,
        icon: 'icon-Signature',
        title: 'signature',
        showType: TItemActionShowType.MENU
    },
    {
        id: 3,
        icon: 'icon-Print',
        title: 'print',
        showType: TItemActionShowType.MENU
    },
    {
        id: 4,
        icon: 'icon-Link',
        title: 'link',
        showType: TItemActionShowType.MENU
    },
    {
        id: 5,
        icon: 'icon-Edit',
        title: 'edit',
        showType: TItemActionShowType.MENU
    },
    {
        id: 6,
        icon: 'icon-Copy',
        title: 'copy',
        showType: TItemActionShowType.MENU
    },
    {
        id: 7,
        icon: 'icon-Paste',
        title: 'phone',
        showType: TItemActionShowType.MENU
    },
    {
        id: 8,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: TItemActionShowType.MENU
    },
    {
        id: 9,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.MENU
    }
];

const ACTIONS_FEW = ACTIONS.slice(0, 2);

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _fullActions: any[] = ACTIONS;
    protected _fewActions: any[] = ACTIONS_FEW;

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: DATA
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/tileNew/TileScalingMode/style'];
}
