import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/Source/ToggleEditorButtonIcon/Index';

export default class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editingObject: object;
    protected _typeDescription: object[];
    protected _toggledEditors: string[];

    protected _beforeMount(): void {
        this._editingObject = {
            description: true,
            tileView: false,
            showBackgroundImage: true,
            showVideo: true
        };

        this._typeDescription = [
            {
                name: 'description',
                caption: 'Описание'
            },
            {
                name: 'tileView',
                caption: 'Список плиткой'
            },
            {
                name: 'showVideo',
                caption: 'Показывать видео',
                toggleEditorButtonIcon: 'icon-TFVideoMessage'
            },
            {
                name: 'showBackgroundImage',
                caption: 'Показывать изображение',
                toggleEditorButtonIcon: 'icon-Question2'
            }
        ];

        this._toggledEditors = ['showBackgroundImage'];
    }

    static _styles: string[] = ['Controls-demo/PropertyGridNew/PropertyGrid'];
}
