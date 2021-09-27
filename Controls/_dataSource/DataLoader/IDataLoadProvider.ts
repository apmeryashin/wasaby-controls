export interface IDataLoadProvider<Config, Result> {
    load: (cfg: Config, loadTimeout?: number, listConfigStoreId?: string, dependencies?: unknown[]) => Promise<Result>;
}

export interface IBaseLoadDataConfig {
    afterLoadCallback?: string;
}
