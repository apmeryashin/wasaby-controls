const MAX_COUNT = 500;

const data = [];
for (let i = 0; i < MAX_COUNT; i++) {
    data.push({
        key: i.toString(),
        title: 'Record number - ' + i
    });
}

export function getData(count: number = 500): object[] {
    return data.slice(0, count - 1);
}
