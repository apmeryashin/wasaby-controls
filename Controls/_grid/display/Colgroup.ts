import {mixin} from 'Types/util';
import {Model, OptionsToPropertyMixin, VersionableMixin} from 'Types/entity';

import {TColumns} from './interface/IColumn';

import Collection from './Collection';
import ColgroupCell from './ColgroupCell';

type TColgroupCells<T extends Model = Model> = Array<ColgroupCell<T>>;

export interface IOptions<T extends Model = Model> {
    owner: Collection<T>;
    gridColumnsConfig: TColumns;
}

export default class Colgroup<T extends Model = Model> extends mixin<
    OptionsToPropertyMixin,
    VersionableMixin
>(
    OptionsToPropertyMixin,
    VersionableMixin
) {
    protected _$owner: Collection<T>;
    protected _$cells: TColgroupCells<T>;
    protected _$gridColumnsConfig: TColumns;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        this._$cells = this._prepareCells(this._$gridColumnsConfig);
    }

    getBodyClasses(): string {
        return 'controls-Grid__colgroup';
    }

    getCells(): TColgroupCells<T> {
        return this._$cells;
    }

    getCellIndex(cell: ColgroupCell<T>): number {
        return this._$cells.indexOf(cell);
    }

    getMultiSelectVisibility(): string {
        return this._$owner.getMultiSelectVisibility();
    }

    setMultiSelectVisibility(newVisibility: string) {
        // TODO: Можно переделать на чесное обновление, не критично.
        this.reBuild();
    }

    hasMultiSelectColumn(): boolean {
        return this._$owner.hasMultiSelectColumn();
    }

    reBuild(): void {
        this._$cells = this._prepareCells(this._$gridColumnsConfig);
        this._nextVersion();
    }

    setGridColumnsConfig(newColumns: TColumns): void {
        // TODO: Можно переделать на чесное обновление, не критично.
        this._$gridColumnsConfig = newColumns;
        this.reBuild();
    }

    protected _prepareCells(columns: TColumns): TColgroupCells<T> {
        const cells = [];

        if (this.hasMultiSelectColumn()) {
            cells.push(new ColgroupCell({
                owner: this
            }));
        }

        columns.forEach((elem) => {
            cells.push(new ColgroupCell({
                owner: this,
                width: elem.width,
                compatibleWidth: elem.compatibleWidth
            }));
        });

        if (this._$owner.hasItemActionsSeparatedCell()) {
            cells.push(new ColgroupCell({
                owner: this,
                width: '0px'
            }));
        }

        return cells;
    }
}

Object.assign(Colgroup.prototype, {
    '[Controls/_display/grid/Colgroup]': true,
    _moduleName: 'Controls/display:GridColgroup',
    _instancePrefix: 'grid-colgroup',
    _$owner: null,
    _$gridColumnsConfig: null
});
