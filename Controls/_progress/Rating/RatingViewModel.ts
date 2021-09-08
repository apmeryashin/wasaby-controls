const STARS_COUNT = 5;

interface IRatingItem {
    index: number;
    type: 'full' | 'half' | 'empty';
    icon: string;
    iconStyle: string;
}

interface IRatingViewModelOptions {
    value: number;
    precision: number;
    iconStyle: string;
    emptyIconStyle: string;
}

class RatingViewModel {
    private _version: number = 1;
    private _value: number;
    private _items: IRatingItem[] | null = null;
    private _iconStyle: string;
    private _emptyIconStyle: string;
    private _precision: number;

    constructor(options: IRatingViewModelOptions) {
        this._value = options.precision ? options.value : Math.floor(options.value);
        this._iconStyle = options.iconStyle;
        this._emptyIconStyle = options.emptyIconStyle;
        this._precision = options.precision;
    }

    getVersion(): number {
        return this._version;
    }

    _nextVersion(): void {
        this._version++;
    }

    getItems(): IRatingItem[] {
        if (!this._items) {
            this._items = RatingViewModel._generateItems(this._value, this._iconStyle, this._emptyIconStyle);
        }
        return this._items;
    }

    setOptions({value, precision, emptyIconStyle, iconStyle}: IRatingViewModelOptions): void {
        if (precision !== this._precision) {
            this._precision = precision;
            this._items = null;
        }

        if (value !== this._value) {
            this._value = this._precision ? value : Math.floor(value);
            this._items = null;
        }

        if (emptyIconStyle !== this._emptyIconStyle) {
            this._emptyIconStyle = emptyIconStyle;
            this._items = null;
        }

        if (iconStyle !== this._iconStyle) {
            this._iconStyle = iconStyle;
            this._items = null;
        }
        this._nextVersion();
    }

    setValue(value: number): void {
        if (value !== this._value) {
            this._value = this._precision ? value : Math.floor(value);
            this._items = null;
        }
        this._nextVersion();
    }

    private static _generateItems(value: number, iconStyle: string, emptyIconStyle: string): IRatingItem[] {
        const items: IRatingItem[] = [];

        const floor = Math.floor(value);
        const round = Math.round(value);

        const lastFull = floor;
        let needHalf = false;

        if (round > floor) {
            needHalf = true;
        }

        for (let i = 1; i <= STARS_COUNT; i++) {
            if (i <= lastFull) {
                items.push({
                    index: i,
                    type: 'full',
                    icon: 'icon-Favorite',
                    iconStyle
                });
            } else if ((i === lastFull + 1) && (needHalf)) {
                items.push({
                    index: i,
                    type: 'half',
                    icon: 'icon-FavoriteHalf',
                    iconStyle
                });
            } else {
                items.push({
                    index: i,
                    type: 'empty',
                    icon: 'icon-Unfavorite',
                    iconStyle: emptyIconStyle
                });
            }
        }

        return items;
    }
}

export default RatingViewModel;