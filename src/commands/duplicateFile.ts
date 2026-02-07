import * as vscode from 'vscode';
import * as path from 'path';

export default async function duplicateFile(uri: vscode.Uri) {
    if (!uri) {
        // Fallback for command palette usage
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            uri = activeEditor.document.uri;
        } else {
            vscode.window.showErrorMessage('Please select a resource to duplicate.');
            return;
        }
    }

    try {
        const stat = await vscode.workspace.fs.stat(uri);
        const isDirectory = (stat.type & vscode.FileType.Directory) !== 0;

        const baseFileDir = path.dirname(uri.fsPath);
        const baseName = path.basename(uri.fsPath);
        
        const newNameSuggestion = await getUniqueName(baseFileDir, baseName);
        
        // Smart selection: select filename but not extension (if it exists)
        const extIndex = newNameSuggestion.lastIndexOf('.');
        const selectionEnd = extIndex > 0 ? extIndex : newNameSuggestion.length;

        const newName = await vscode.window.showInputBox({
            prompt: `Enter name for duplicated ${isDirectory ? 'folder' : 'file'}`,
            value: newNameSuggestion,
            valueSelection: [0, selectionEnd]
        });

        if (!newName) {
            return;
        }

        const newFilePath = path.join(baseFileDir, newName);
        const newUri = vscode.Uri.file(newFilePath);

        try {
            await vscode.workspace.fs.stat(newUri);
            vscode.window.showErrorMessage(`${isDirectory ? 'Folder' : 'File'} already exists: ${newName}`);
            return;
        } catch {
            // Target does not exist, which is what we want
        }

        // Perform the copy (Recursive for folders, atomic for files)
        await vscode.workspace.fs.copy(uri, newUri, { overwrite: false });

        // Only open the file if it's a file
        if (!isDirectory) {
            const doc = await vscode.workspace.openTextDocument(newUri);
            await vscode.window.showTextDocument(doc);
        }

    } catch (error: any) {
        vscode.window.showErrorMessage(`Error duplicating resource: ${error.message}`);
    }
}

async function getUniqueName(dirPath: string, oldName: string): Promise<string> {
    const ext = path.extname(oldName);
    const nameWithoutExt = path.basename(oldName, ext);
    let counter = 0;
    
    while (true) {
        const suffix = counter === 0 ? '_copy' : `_copy_${counter}`;
        const candidate = `${nameWithoutExt}${suffix}${ext}`;
        const candidatePath = vscode.Uri.file(path.join(dirPath, candidate));
        
        try {
            await vscode.workspace.fs.stat(candidatePath);
            counter++;
        } catch {
            return candidate;
        }
    }
}
