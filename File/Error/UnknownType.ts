/// <amd-module name="File/Error/UnknownType" />
import FileError = require('File/Error');

const MESSAGE = rk('Неизвестный тип файла');

type ErrorParam = {
    fileName: string;
}

/**
 * Ошибка, когда не смогли определить тип файла
 * @class
 * @name File/Error/UnknownType
 * @public
 * @extends File/Error
 */
class UnknownTypeError extends FileError {
    public maxSize: number;
    constructor(params: ErrorParam) {
        super({
            message: MESSAGE,
            fileName: params.fileName
        });
        /*
         * https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
         */
        Object.setPrototypeOf(this, UnknownTypeError.prototype);
    }
}

export = UnknownTypeError;
