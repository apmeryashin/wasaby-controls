import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/RichTemplate/TitlePositionOnImage/Template';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import {HierarchicalMemory} from 'Types/source';

const DATA = [
    {
        id: 1,
        parent: null,
        type: null,
        title: 'Шаблон 5.2 с изображением и заголовком на нем',
        gradientColor: '#FFF',
        description: 'Заголовок на изображении, описание - под изображением',
        imageProportion: '1:1',
        titleLines: 3,
        imagePosition: 'top',
        'parent@': null,
        imageHeight: 's',
        image: explorerImages[8],
        isShadow: true
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: DATA
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
