const fs = require('fs');

const getFiles = (dir, result = []) => {
    const files = fs.readdirSync(dir);
    files.map((file) => {
        const name = dir + '/' + file;
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, result);
        } else {
            result.push(name);
        }
    });
    return result;
};

const getFileData = (filePath) => {
    return  fs.readFileSync(filePath, "utf8");
};

const getFileJSONData = (fileContent) => {
    let lines = fileContent.split('\n');
    lines = lines.map((line) => {
        line = line.trim();
        if (line.includes('--')) {
            const startIndexProperty = line.indexOf('-');
            const endIndexProperty = line.indexOf(':');
            const property = line.slice(startIndexProperty, endIndexProperty);

            const endIndexValue = line.indexOf(';');
            let value = line.slice(endIndexProperty + 1, endIndexValue).trim();

            value = value.replace("\\e", "\\\\e");
            return `  "${property}": "${value}",`;
        }
    }).filter((line) => line !== undefined);
    return lines.join('\n');
}

const writeJSONData = (files = []) => {
    let resultString = '{\n';
    files.map((file, index) => {
        const fileContent = getFileData(file);
        const fileJSONContent = getFileJSONData(fileContent);
        if (index !== 0) {
            resultString += '\n\n';
        }
        resultString += fileJSONContent;
    });
    resultString = resultString.slice(0, resultString.length - 1); // обрезаем последнюю запятую
    resultString += '\n}';
    fs.writeFileSync("fallback.json", resultString);
};

const lessFiles = getFiles('./variables');
writeJSONData(lessFiles);
console.log('success');
