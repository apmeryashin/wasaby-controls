import {Logger} from 'UI/Utils';

function isNumeric(
    value: number,
    controlName?: string,
    optionName?: string
): boolean {
    const option = optionName ? optionName : 'Value';
    if (isNaN(value)) {
        if (controlName && controlName.length) {
            Logger.error(`${controlName}: ${option} [${value}] is incorrect, it contains non-numeric value`);
        }
        return false;
    }
    return true;
}

function isValueInRange(
    value: number,
    minValue: number = 0,
    maxValue: number = 100,
    controlName?: string,
    optionName?: string
): boolean {
    const option = optionName ? optionName : 'Value';
    if (value < minValue || value > maxValue) {
        if (controlName && controlName.length) {
            Logger
                .error(`${controlName}: ${option} [${value}] must be in range of [${minValue}..${maxValue}]`);
        }
        return false;
    }
    return true;
}

function isSumInRange(
    data: object[],
    maxValue: number = 100,
    controlName?: string
): boolean {
    const logError = controlName && controlName.length;
    const sum = data.map(Object).reduce((curSum, item) => {
        if (isNaN(item.value) && logError) {
            Logger.error(`${controlName}: Value [${item.value}] is non-numeric`);
        }
        return curSum + Math.max(item.value, 0);
    }, 0);

    if (isNaN(sum)) {
        return false;
    }

    if (sum > maxValue) {
        if (logError) {
            Logger.error(`${controlName}: Data is incorrect. Values total is greater than ${maxValue}`);
        }
        return false;
    }

    return true;
}

export {isNumeric, isValueInRange, isSumInRange};
