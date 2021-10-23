export function applyHighlighter(highlighters: any[]): string {
    let result: string = '';

    const args = arguments;

    if (highlighters) {
        highlighters.forEach((highlighter) => {
            result += highlighter.apply(undefined, Array.prototype.slice.call(args, 1));
        });
    }

    return result;
}
