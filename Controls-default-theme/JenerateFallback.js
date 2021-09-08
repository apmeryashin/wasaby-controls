var fs = require('fs');

var getFiles = function(dir, result) {
    result = result || [];
    var files = fs.readdirSync(dir);
    files.map(function(file) {
        var name = dir + '/' + file;
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, result);
        } else {
            result.push(name);
        }
    });
    return result;
};

var getFileData = function(filePath) {
    return fs.readFileSync(filePath, "utf8");
};

var removeSubstr = function(value, startIndex, length) {
    return value.slice(0, startIndex) + value.slice(startIndex + length, value.length);
}

var prepareValue = function(hashMap, value) {
    var oldValue = value;
    //console.log('old', value);

    var calcIndex = value.indexOf('calc(');

    while (calcIndex !== -1) {
        value = removeSubstr(value, calcIndex, 5); // обрезаем calc(
        // удаляю закрывающуюся скобку от calc
        var countSBracket = 1;
        for (var j = calcIndex; j < value.length; j++) {
            if (value[j] === '(') {
                countSBracket++;
            } else if (value[j] === ')') {
                countSBracket--;
            }
            if (countSBracket === 0) {
                value = removeSubstr(value, j, 1);
                break;
            }
        }


        var varIndex = value.indexOf('var(');
        while (varIndex !== -1) {
            value = removeSubstr(value, varIndex, 4); // обрезаем var(
            var property =  '';
            for (var i =    varIndex; i < value.length; i++) {
                if (value[i] !== ')') {
                    property += value[i];
                } else {
                    value = removeSubstr(value, i, 1); // обрезаем ) от var
                    break;
                }
            }

            if (!hashMap[property]) {
                console.log('Ошибка: Не найдено значения переменной ' + property + ' в выражении ' + oldValue);
            }
            var propertyValue = hashMap[property];
            value = value.replace(property, propertyValue);

            varIndex = value.indexOf('var(');
        }

        calcIndex = value.indexOf('calc(');
    }

    value = value.replace(/px/gi, ''); // убираю px

    var newValue = eval(value);
    //console.log('new', newValue);

    if (!isNaN(newValue)) {
        return newValue + 'px';
    }
    return undefined;
}
var hashMap = {};

var getFileJSONData = function(fileContent, prepareHashMap) {
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
            if (prepareHashMap) {
                hashMap[property] = value;
            } else {
                if (value.includes('calc')) {
                    value = prepareValue(hashMap, value);
                }
            }
            return '  "' + property + '": "' + value + '",';
        }
    }).filter(function(line) { return line !== undefined });
    return lines.join('\n');
}

var writeJSONData = function(files, prepareHashMap) {
    files = files || [];
    var resultString = '{\n';
    files.map(function(file, index) {
        var fileContent = getFileData(file);
        var fileJSONContent = getFileJSONData(fileContent, prepareHashMap);
        if (index !== 0) {
            resultString += '\n\n';
        }
        resultString += fileJSONContent;
    });
    resultString = resultString.slice(0, resultString.length - 1); // обрезаем последнюю запятую
    resultString += '\n}';
    fs.writeFileSync("fallback.json", resultString);
};

var lessFiles = getFiles('./variables');
writeJSONData(lessFiles, true);
writeJSONData(lessFiles);
console.log('success');
