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

var getFileJSONData = function(fileContent) {
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
            return '  "' + property + '": "' + value + '",';
        }
    }).filter(function(line) { return line !== undefined });
    return lines.join('\n');
}

var writeJSONData = function(files) {
    files = files || [];
    var resultString = '{\n';
    files.map(function(file, index) {
        var fileContent = getFileData(file);
        var fileJSONContent = getFileJSONData(fileContent);
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
writeJSONData(lessFiles);
console.log('success');
