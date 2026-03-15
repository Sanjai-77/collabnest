import fs from 'fs';
import path from 'path';

function findTextUsage(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                findTextUsage(fullPath);
            }
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasTextJSX = content.includes('<Text');
            const hasDestructuredText = content.includes('Text } = Typography') || content.includes('Text} = Typography') || content.includes('const { Text } = Typography');
            const hasImportedText = content.includes("import { Text } from 'antd'"); // unlikely but check
            
            if (hasTextJSX && !hasDestructuredText && !hasImportedText) {
                console.log(`BROKEN: ${fullPath}`);
            }
        }
    }
}

findTextUsage('d:/collabnest/frontend/src');
