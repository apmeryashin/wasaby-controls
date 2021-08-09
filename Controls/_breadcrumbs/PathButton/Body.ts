import {ICrud} from 'Types/source';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TKey} from 'Controls/_interface/IItems';
import {View as TreeGrid} from 'Controls/treeGrid';
import {Path} from 'Controls/_dataSource/calculatePath';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_breadcrumbs/PathButton/Body';

export interface IBody extends IControlOptions {
    path: Path;
    source: ICrud;
    keyProperty: string;
    nodeProperty: string;
    parentProperty: string;
    displayProperty: string;
}

/**
 * Компонент предоставляет view, отображаемое в popup у {@link Controls/breadcrumbs:PathButton}, и реализует
 * логику обработки взаимодействия с пользователем.
 *
 * @author Уфимцев Д.Ю.
 */
export default class Body extends Control<IBody> {
    //region base props
    protected _template: TemplateFunction = template;

    protected _children: {
        treeGrid: TreeGrid;
    };
    //endregion

    protected _markedKey: TKey;

    protected _expandedItems: TKey[] = [];

    protected _beforeMount(options?: IBody, contexts?: object, receivedState?: void): Promise<void> | void {
        if (!options.path.length) {
            return;
        }

        this._markedKey = options.path[options.path.length - 1].getKey();
        this._expandedItems = options.path.map((item) => item.getKey());
        this._expandedItems.pop();
    }

    /**
     * Обработчик клика по кнопке в заголовке
     */
    protected _goToRoot(): void {
        let root = null;
        const items = this._children.treeGrid.getItems();

        // Если записи есть, то берем у первой parentProperty - это и будет root
        if (items.getCount()) {
            root = items.at(0).get(this._options.parentProperty);
        }

        this._changePath(root);
    }

    /**
     * Обработчик клика по записи списка
     */
    protected _onItemClick(event: SyntheticEvent, item: Model): void {
        this._changePath(item.getKey());
    }

    /**
     * Обработчик клика по крестику закрытия.
     */
    protected _onCloseClick(): void {
        this._notify('close', [], {bubbling: true});
    }

    /**
     * Посылает событие о изменении пути
     */
    private _changePath(root: TKey): void {
        this._notify('sendResult', [this._buildPathByRoot(root)], {bubbling: true});
    }

    /**
     * На основании переданного root собирает путь до корня списка каталогов
     */
    private _buildPathByRoot(root: TKey): Path {
        const path = [] as Path;
        const items = this._children.treeGrid.getItems();
        let rootItem = items.getRecordById(root);

        while (rootItem) {
            path.unshift(
                new Model({
                    keyProperty: this._options.keyProperty,
                    rawData: {
                        [this._options.keyProperty]: rootItem.getKey(),
                        [this._options.parentProperty]: rootItem.get(this._options.parentProperty),
                        [this._options.displayProperty]: rootItem.get(this._options.displayProperty)
                    }
                })
            );

            rootItem = items.getRecordById(
                rootItem.get(this._options.parentProperty)
            );
        }

        return path;
    }
}
