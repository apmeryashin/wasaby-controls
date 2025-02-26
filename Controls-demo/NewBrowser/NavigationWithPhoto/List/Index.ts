import {Memory} from 'Types/source';
import {Control, TemplateFunction} from 'UI/Base';
import {BeforeChangeRootResult, DetailViewMode, IBrowserViewConfig, IRootsData} from 'Controls/newBrowser';
import {FlatHierarchy, BrandsImages} from 'Controls-demo/DemoData';
import {DemoSource, getDefaultViewCfg} from 'Controls-demo/NewBrowser/DemoSource';
import {constants} from 'Env/Env';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/NewBrowser/NavigationWithPhoto/List/List';
import {SyntheticEvent} from 'UI/Vdom';
import {TKey} from 'Controls/_interface/IItems';

const getData = () => {
    const item = {
        id: 1,
        title: 'Apple',
        description: 'Apple (МФА: [ˈæp(ə)l], в переводе с англ. — «яблоко») — американская корпорация, производитель персональных и планшетных компьютеров, аудиоплееров, смартфонов, программного обеспечения. Один из пионеров в области персональных компьютеров[10] и современных многозадачных операционных систем с графическим интерфейсом. Штаб-квартира — в Купертино, штат Калифорния. Благодаря инновационным технологиям и эстетичному дизайну, корпорация Apple создала в индустрии потребительской электроники уникальную репутацию, сравнимую с культом[11]. Является первой американской компанией, чья капитализация превысила 1,044 трлн долларов США. Это произошло во время торгов акциями компании 10 сентября 2018 года[12]. В тот же день компания стала самой дорогой публичной компанией за всю историю, превысив капитализацию предыдущего рекордсмена — компании PetroChina (1,005 трлн долларов в ноябре 2007 года)[13].',
        country: 'США',
        rating: '8.5',
        parent: null,
        type: true,
        hasChild: false,
        hasSubNodes: false,
        photo: null
    };
    const items = [];
    const COUNT_ITEMS_WITHOUT_PHOTO = 30;
    const COUNT_ITEMS_WITH_PHOTO = 40;
    for (let i = 0; i < (COUNT_ITEMS_WITH_PHOTO + COUNT_ITEMS_WITHOUT_PHOTO); i++) {
        const resultItem = {...item,
            id: item.id + i,
            title: item.title + `Элемент ${item.id + i}`
        };
        if (i > COUNT_ITEMS_WITHOUT_PHOTO) {
            resultItem.photo = BrandsImages.apple;
        }
        items.push(resultItem);
    }
    return items;
};

const baseSource = new DemoSource({
    keyProperty: 'id',
    parentProperty: 'parent',
    data: getData()
});

function findParentFolderId(itemId: TKey): TKey {
    if (!itemId) {
        return null;
    }
    const data = getData();
    const item = data.find((dataItem) => dataItem.id === itemId);

    if (item.hasSubNodes) {
        return item.id;
    }

    if (item.parent === null) {
        return null;
    }

    const parent = data.find((dataItem) => dataItem.id === item.parent);
    if (parent.hasSubNodes) {
        return parent.id;
    }

    return findParentFolderId(parent.id);
}

export default class extends Control {
    protected _template: TemplateFunction = Template;

    protected _children: {
        browser: Browser
    };

    /**
     * Корневая директория detail списка
     */
    protected _root: TKey = null;

    /**
     * Корневая директория master списка
     */
    protected _masterRoot: TKey = null;

    protected _fallbackImage: string = constants.resourceRoot + 'Controls-demo/resources/images/green_development.png';

    /**
     * Флаг, идентифицирующий видна или нет master-колонка
     */
    protected _isMasterVisible: boolean = true;

    /**
     * Источник данных для колонок каталога
     */
    protected _baseSource: DemoSource = baseSource;

    /**
     * Источник данных для выбора режима отображения списка в detail-колонке
     */
    protected _viewModeSource: Memory = new Memory({
        keyProperty: 'key',
        data: [
            {
                title: 'Список',
                icon: 'icon-ArrangeList',
                key: DetailViewMode.list
            },
            {
                title: 'Плитка',
                icon: 'icon-ArrangePreview',
                key: DetailViewMode.tile
            },
            {
                title: 'Таблица',
                icon: 'icon-Table',
                key: DetailViewMode.table
            }
        ]
    });
    protected _viewMode: DetailViewMode = DetailViewMode.list;
    protected _userViewMode: DetailViewMode[] = [DetailViewMode.list];
    protected _defaultViewCfg: IBrowserViewConfig = getDefaultViewCfg();

    /**
     * Набор колонок, отображаемый в master
     */
    protected _masterTableColumns: unknown[] = FlatHierarchy.getGridColumns(1);

    /**
     * Фильтр по которому отбираются только узлы в master-колонке
     */
    protected _masterFilter: {[key: string]: unknown} = {type: [true, false]};

    /**
     * Набор колонок, отображаемый в detail
     */
    protected _detailTableColumns: unknown[] = FlatHierarchy.getGridColumns();

    //region life circle hooks
    protected _componentDidMount(options?: {}, contexts?: any): void {
        this._userViewMode = [this._children.browser.viewMode];
    }
    //endregion

    protected _onBeforeRootChanged(event: SyntheticEvent, roots: IRootsData): BeforeChangeRootResult {
        return {
            detailRoot: roots.detailRoot,
            masterRoot: findParentFolderId(roots.masterRoot)
        };
    }

    protected _onBrowserViewModeChanged(event: SyntheticEvent, viewMode: DetailViewMode): void {
        this._userViewMode = [viewMode];
    }

    protected _onUserViewModeChanged(event: SyntheticEvent, viewMode: DetailViewMode[]): void {
        if (this._children.browser.viewMode === viewMode[0]) {
            return;
        }

        this._viewMode = viewMode[0];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
