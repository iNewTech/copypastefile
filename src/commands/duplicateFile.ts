import * as vscode from 'vscode';
import * as path from 'path';

export default async function duplicateFile(uri: vscode.Uri) {
    
    const baseFile = uri.fsPath;
    const baseFileName = path.basename(baseFile);
    const baseFileExt = path.extname(baseFileName);
    const baseFileNameWithoutExt = path.basename(baseFile, path.extname(baseFile));
    const baseFileDir = path.dirname(baseFile);

    let counter = 0;
    let newFileNameSuggestion: string;

    while (true) {
        if (counter === 0) {
            newFileNameSuggestion = `${baseFileNameWithoutExt}_copy${baseFileExt}`;
        } else {
            newFileNameSuggestion = `${baseFileNameWithoutExt}_copy_${counter}${baseFileExt}`;
        }

        const newFilePath = path.join(baseFileDir, newFileNameSuggestion);
        try {
            await vscode.workspace.fs.stat(vscode.Uri.file(newFilePath));
            counter++;
        } catch {
            // file does not exist, so we can use this path
            break;
        }
    }
    
    const newFileName = await vscode.window.showInputBox({
        prompt: `Please enter new file name`,
        value: newFileNameSuggestion
    });

    if (newFileName === undefined || newFileName === '') {
        return;
    }

    const newFilePath = path.join(baseFileDir, newFileName);

    try {
        await vscode.workspace.fs.stat(vscode.Uri.file(newFilePath));
        vscode.window.showErrorMessage(`File already exists: ${newFileName}`);
        return;
    } catch {
        // file does not exist, which is what we want
    }

    try {
        const content = await vscode.workspace.fs.readFile(uri);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(newFilePath), content);
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(newFilePath));
        await vscode.window.showTextDocument(doc);
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}
