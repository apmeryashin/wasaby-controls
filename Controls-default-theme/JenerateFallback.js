var fs = require('fs');
var PATH_FROM = './Controls-default-theme/variables';
var PATH_TO = './Controls-default-theme/fallback.json';
var CALC_PREFIX = 'calc(';
var VAR_PREFIX = 'var(';

var hashMap = {};

var getFiles = function (dir, result) {
    result = result || [];
    var files = fs.readdirSync(dir);
    files.map(function (file) {
        var name = dir + '/' + file;
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, result);
        } else {
            result.push(name);
        }
    });
    return result;
};

var getFileData = function (filePath) {
    return fs.readFileSync(filePath, 'utf8');
};

var removeSubstr = function (value, startIndex, length) {
    return value.slice(0, startIndex) + value.slice(startIndex + length, value.length);
}

var getCalcValue = function (value, calcIndex) {
    var countSBracket = 1;
    for (var j = calcIndex; j < value.length; j++) {
        if (value[j] === '(') {
            countSBracket++;
        } else if (value[j] === ')') {
            countSBracket--;
        }
        if (countSBracket === 0) {
            value = removeSubstr(value, j, 1);
            return {
                value: value,
                calcContent: value.substr(calcIndex, j - calcIndex)
            }
        }
    }
}

var calcCycle = function(value, oldValue) {
    var calcIndex = value.lastIndexOf(CALC_PREFIX);
    while (calcIndex !== -1) {
        value = removeSubstr(value, calcIndex, CALC_PREFIX.length); // обрезаем calc(
        var data = getCalcValue(value, calcIndex);
        var calcContent = data.calcContent;
        value = data.value;
        var calcValue = prepareValue(calcContent, true, oldValue);
        value = value.replace(calcContent, calcValue);

        calcIndex = value.lastIndexOf(CALC_PREFIX);
    }
    return value;
}

var getPropertyNameAndRemoveVarBracket = function (value, varIndex) {
    var property = '';
    for (var i = varIndex; i < value.length; i++) {
        if (value[i] !== ')') {
            property += value[i];
        } else {
            value = removeSubstr(value, i, 1); // обрезаем ) от var
            return {
                value: value,
                property: property
            };
        }
    }
    return {
        value: value,
        property: property
    };
}

var calcVarValue = function(value, oldValue) {
    var varIndex = value.indexOf(VAR_PREFIX);

    while (varIndex !== -1) {
        value = removeSubstr(value, varIndex, VAR_PREFIX.length); // обрезаем var(
        var data = getPropertyNameAndRemoveVarBracket(value, varIndex);
        var property = data.property;
        value = data.value;

        if (!hashMap[property]) {
            console.log('Ошибка: Не найдено значения переменной ' + property + ' в выражении ' + oldValue);
        }

        var propertyValue = hashMap[property];
        value = value.replace(property, propertyValue);

        varIndex = value.indexOf(VAR_PREFIX);
    }
    return value;
}

var prepareValue = function (value, isRec, oldValue) {
    if (!isRec) {
        //console.log('old', value);
    }
    oldValue = oldValue || value;

    if (value.includes('calc(var(--inline_height_m-button) / 2)')) {
        debugger;
    }

    var calcIndex = value.lastIndexOf(CALC_PREFIX);

    if (calcIndex !== -1) {
        value = calcCycle(value, oldValue);
    } else {
        value = calcVarValue(value, oldValue);
        value = calcCycle(value, oldValue);
    }


    value = value.replace(/px/gi, ''); // убираю px

    var newValue = eval(value);
    if (!isRec) {
        //console.log('new', newValue);
    }

    if (!isNaN(newValue)) {
        return newValue + 'px';
    }
    return undefined;
}

var lessFilesDataIterator = function (fileContent, callback) {
    var lines = fileContent.split('\n');
    lines = lines.map(function (line) {
        line = line.trim();
        if (line.includes('--')) {
            var startIndexProperty = line.indexOf('-');
            var endIndexProperty = line.indexOf(':');
            var property = line.slice(startIndexProperty, endIndexProperty);

            var endIndexValue = line.indexOf(';');
            var value = line.slice(endIndexProperty + 1, endIndexValue).trim();

            value = value.replace("\\e", "\\\\e");
            value = callback(value, property);

            return '  "' + property + '": "' + value + '",';
        }
    }).filter(function (line) {
        return line !== undefined
    });
    return lines.join('\n');
}

var getFileJSONData = function (fileContent, prepareHashMap) {
    return lessFilesDataIterator(fileContent, function (value) {
        if (value.includes('calc')) {
            return prepareValue(value);
        }
        return value;
    })
}

var calcHashMap = function (files) {
    files = files || [];
    files.map(function (file, index) {
        var fileContent = getFileData(file);
        lessFilesDataIterator(fileContent, function (value, property) {
            hashMap[property] = value;
        });
    });
}

var writeJSONData = function (files, prepareHashMap) {
    files = files || [];
    var resultString = '{\n';
    files.map(function (file, index) {
        var fileContent = getFileData(file);
        var fileJSONContent = getFileJSONData(fileContent, prepareHashMap);
        if (index !== 0) {
            resultString += '\n\n';
        }
        resultString += fileJSONContent;
    });
    resultString = resultString.slice(0, resultString.length - 1); // обрезаем последнюю запятую
    resultString += '\n}';
    fs.writeFileSync(PATH_TO, resultString);
};

var lessFiles = getFiles(PATH_FROM);
calcHashMap(lessFiles);
writeJSONData(lessFiles);
console.log('success');
