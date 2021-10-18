export function getConfig({key, source}): object {
    return {
        record: {
            type: 'custom',
            loadDataMethod: () => {
                return source.read(key);
            },
            dependentArea: ['workspace']
        }
    };
}
