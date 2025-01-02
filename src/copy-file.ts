import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from "fs";

export default function copyFile(uri: vscode.Uri) {
    
    const anyFile = uri.fsPath;
    const anyFileName = path.basename(anyFile);
    const anyFileDir = path.dirname(anyFile);
    const anyFileContent = fs.readFileSync(anyFile, 'utf8');
    vscode.window.showInputBox({
        prompt: `Please enter new file name`,
        value: anyFileName
    }).then((newFileName) => {
        if (newFileName === undefined) {
            return;
        } else if (newFileName === '') {
            vscode.window.showErrorMessage(`Error: Blank file name not allowed`);
            return;
        } else if (newFileName === anyFileName) {
            vscode.window.showErrorMessage(`Error: New file name cannot be same as old file name`);
            return;
        } else if (!newFileName.includes('.yaml') && !newFileName.includes('.yml')) {
            newFileName = newFileName + '.yaml';
            if (newFileName === anyFileName) {
                vscode.window.showErrorMessage(`Error: New file name cannot be same as old file name`);
                return;
            }
        }
        const newFilePath = path.join(anyFileDir, newFileName);
        fs.writeFileSync(newFilePath, anyFileContent);
        vscode.workspace.openTextDocument(newFilePath).then(doc => {
            vscode.window.showTextDocument(doc);
        });
    });
}

export function getTargetPath(sourcePath: string): string {
    const dir = path.dirname(sourcePath);
    const ext = path.extname(sourcePath);
    const base = path.basename(sourcePath, ext);
    let counter = 1;
    let targetPath: string;

    do {
        targetPath = path.join(dir, `${base}_copy${counter}${ext}`);
        counter++;
    } while (fs.existsSync(targetPath));

    return targetPath;
}