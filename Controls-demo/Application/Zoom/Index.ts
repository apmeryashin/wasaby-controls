import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Application/Zoom/Index');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Application/Zoom/Index';
import {Memory} from 'Types/source';
import {ZoomSize} from 'Controls/sizeUtils';
import {DialogOpener, StackOpener} from 'Controls/popup';
const ZOOM_SIZES = Object.keys(ZoomSize).map((key) => {
    return {key};
});

export default class Stack extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _zoom: string[] = [ZoomSize['zoom-1']];
    protected _zoomDdlSource: Memory = new Memory({
        keyProperty: 'key',
        data: ZOOM_SIZES
    });
    protected _openStack(): void {
        new StackOpener().open({
            opener: this,
            minimizedWidth: 600,
            minWidth: 600,
            width: 600,
            maxWidth: 800,
            template: 'Controls-demo/Popup/Opener/resources/StackTemplate',
            templateOptions: {
                maximized: true,
                maximizedButtonVisibility: true
            }
        });
    }
    protected _openDialog(): void {
        new DialogOpener().open({
            opener: this,
            closeOnOutsideClick: true,
            templateOptions: {
                draggable: true
            },
            propStorageId: 'draggableDialog',
            maxHeight: 700,
            width: 600,
            template: 'Controls-demo/Popup/Opener/resources/DialogTpl',
            minWidth: 500
        });
    }
}
