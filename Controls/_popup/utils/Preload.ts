
interface IPrefetchPromises {  // TODO: Compatible предзагрузка
    [key: string]: Promise<unknown>;
}
export interface IPrefetchData {  // TODO: Compatible предзагрузка
    [key: string]: unknown;
}

/**
 * Преобразовывает prefetchPromise в prefetchData
 * TODO: Этого не должно быть, должно быть у сухоручкина, когда будут pageId
 * @param prefetchPromise
 */
function waitPrefetchData(prefetchPromise: Promise<IPrefetchPromises>): Promise<IPrefetchData> {
    return prefetchPromise.then((prefetchPromiseData: IPrefetchPromises) => {
        const promiseArray = Object.values(prefetchPromiseData);
        return Promise.allSettled(promiseArray).then(
            (dataArray: Array<{status: string, value?: unknown, reason?: unknown}>) => {
                const keys = Object.keys(prefetchPromiseData);
                const data = {};
                let i = 0;
                for (const key of keys) {
                    const promiseResult = dataArray[i++];
                    data[key] = promiseResult.value || promiseResult.reason;
                }
                return data;
            });
    });
}

export {waitPrefetchData}