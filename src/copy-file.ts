import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from "fs";

export default function copyFile(uri: vscode.Uri) {
    
    const baseFile = uri.fsPath;
    const baseFileName = path.basename(baseFile);
    const baseFileNameWithoutExt = path.basename(baseFile, path.extname(baseFile));
    const baseFileDir = path.dirname(baseFile);
    const baseFileContent = fs.readFileSync(baseFile, 'utf8');
    const baseFileExt = path.extname(baseFileName);
    vscode.window.showInputBox({
        prompt: `Please enter new file name`,
        value: baseFileName
    }).then((newFileName) => {
        if (newFileName === undefined) {
            return;
        } else if (newFileName === '') {
            vscode.window.showErrorMessage(`Error: Blank file name not allowed`);
            return;
        } else if (newFileName === baseFileName || newFileName === baseFileNameWithoutExt) {
            vscode.window.showErrorMessage(`Error: New file name cannot be same as old file name - ${newFileName}`);
            newFileName = newFileName + '_copy';
        } else {
            // Preserve the original file extension if not already included
            if (!newFileName.includes('.')) {
                newFileName = newFileName + baseFileExt;
            }
        }
        const newFilePath = path.join(baseFileDir, newFileName);
        fs.writeFileSync(newFilePath, baseFileContent);
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
        targetPath = path.join(dir, `${base}_copy_${counter}${ext}`);
        counter++;
    } while (fs.existsSync(targetPath));

    return targetPath;
}