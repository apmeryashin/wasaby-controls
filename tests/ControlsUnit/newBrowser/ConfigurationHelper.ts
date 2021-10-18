import {
    DetailViewMode,
    IBrowserViewConfig,
    IListConfig,
    ImageGradient,
    ImageViewMode,
    ITableConfig,
    ITileConfig,
    ListImagePosition,
    NodesPosition,
    TileImagePosition,
    TileSize
} from 'Controls/newBrowser';

export function getDefaultViewCfg(): IBrowserViewConfig {
    return {
        settings: {
            access: 'global',
            accountViewMode: DetailViewMode.list,
            clientViewMode: DetailViewMode.list
        },
        list: LIST_CFG,
        tile: TILE_CFG,
        table: TABLE_CFG
    };
}

const LIST_CFG: IListConfig = {
    list: {
        imagePosition: ListImagePosition.left,
        imageViewMode: ImageViewMode.circle
    },
    node: {
        descriptionLines: 4,
        position: NodesPosition.left
    },
    leaf: {
        descriptionLines: 3
    }
};

const TILE_CFG: ITileConfig = {
    tile: {
        size: TileSize.m,
        imagePosition: TileImagePosition.top
    },
    node: {
        descriptionLines: 3,
        position: NodesPosition.top,
        imageGradient: ImageGradient.custom,
        imageViewMode: ImageViewMode.circle,
        imageProportion: '16:9'
    },
    leaf: {
        descriptionLines: 4,
        imageGradient: ImageGradient.light,
        imageViewMode: ImageViewMode.rectangle,
        imageProportion: '4:3'
    }
};

const TABLE_CFG: ITableConfig = {
    node: {
        position: NodesPosition.left
    },
    leaf: {
        descriptionLines: 2,
        imageViewMode: ImageViewMode.circle
    }
};
