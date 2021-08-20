import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/themes/ZenWrapper/resources/themedContent');
import 'css!Controls-demo/themes/ZenWrapper/resources/Style';
import {Model} from 'Types/entity';
import {HierarchicalMemory} from "Types/source";
import {Flat} from "../../../treeGridNew/DemoHelpers/Data/Flat";

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _bcitems: Model[];
    protected _tgSource: HierarchicalMemory;
    protected _tgColumns: unknown[] = [
        {
            displayProperty: 'title'
        }
    ];

    protected _beforeMount(): void {
        this._bcitems = [
            { id: 1, title: 'Первая папка', parent: null },
            { id: 2, title: 'Вторая папка', parent: 1 },
            { id: 3, title: 'Третья папка', parent: 2 }
        ].map((item) => {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });

        this._tgSource = new HierarchicalMemory({
            keyProperty: 'key',
            data: [
                {
                    key: 2,
                    title: 'Samsung',
                    country: 'Южная Корея',
                    parent: null,
                    type: true
                },
                {
                    key: 21,
                    title: 'Samsung A10',
                    parent: 2,
                    type: null
                },
                {
                    key: 22,
                    title: 'Samsung A20',
                    parent: 2,
                    type: null
                },
                {
                    key: 3,
                    title: 'Iphone',
                    parent: null,
                    type: null
                }
            ],
            parentProperty: 'parent'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Index;
