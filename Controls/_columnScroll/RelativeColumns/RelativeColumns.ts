import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_columnScroll/RelativeColumns/RelativeColumns';
import {isEqual} from 'Types/object';

export interface IRelativeColumnsOptions extends IControlOptions {
    viewColumns: number;
}

const CELL_JS_SELECTOR = 'controls-ColumnScroll__relativeCell';

/**
 * Контрол строит наиболее полный набор колонок таблицы. Подробное описание в контроле.
 * Необходим для корректного подскрола к колонке при лююбой верной конфигурации таблицы.
 * Например, в шапке может не быть ячейки данной колонки, ровно как и в первых десяти записях.
 * Для избежания поиска строки с нужной нам ячейкой, при горизонтальном скролле выводится фейковая строка нулевой высоты
 */
export default class RelativeColumns extends Control<IRelativeColumnsOptions> {
    protected _template: TemplateFunction = template;
    readonly _dataCellClassName: string = CELL_JS_SELECTOR;

    protected _afterMount(options?: IRelativeColumnsOptions, contexts?: any): void {
        this._onRelativeCellContainersChanged();
    }

    protected _afterUpdate(oldOptions?: IRelativeColumnsOptions): void {
        if (!isEqual(this._options.viewColumns, oldOptions.viewColumns)) {
            this._onRelativeCellContainersChanged();
        }
    }

    private _onRelativeCellContainersChanged(): void {
        this._notify('relativeCellContainersChanged', [
            Array.from(this._container.querySelectorAll(`.${CELL_JS_SELECTOR}`))
        ]);
    }
}

export {CELL_JS_SELECTOR as RELATIVE_DATA_CELL_JS_SELECTOR};
