import fs from 'fs';
import path from 'path';

function findFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                results = results.concat(findFiles(fullPath));
            }
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(fullPath);
        }
    }
    return results;
}

const srcDir = 'd:/collabnest/frontend/src';
const allFiles = findFiles(srcDir);

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('<Text')) {
        const hasDestructuring = content.includes('{ Text } = Typography') || 
                               content.includes('{Text} = Typography') || 
                               content.includes('{ Text,') || 
                               content.includes(', Text }') ||
                               content.includes('import { Text }');
        
        if (!hasDestructuring) {
            console.log(`BROKEN: ${file}`);
        } else {
            console.log(`OK: ${file}`);
        }
    }
});
