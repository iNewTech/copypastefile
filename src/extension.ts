import * as vscode from 'vscode';
import copyFile, {getTargetPath} from "./copy-file";

export function activate(context: vscode.ExtensionContext) {

    vscode.window.showInformationMessage('Copy Paste File extension is ready!');
    const disposable = vscode.commands.registerCommand('copypastefile.copyfile', async (uri: vscode.Uri) => {
        if (!uri) {
            vscode.window.showErrorMessage('Please select a file first');
            return;
        }
        
        try {
            await copyFile(uri);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);

    const copypaste = vscode.commands.registerCommand('copypastefile.copypaste', async (uri: vscode.Uri) => {
        if (!uri) {
            vscode.window.showErrorMessage('Please select a file first');
            return;
        }

        try {
            const targetPath = getTargetPath(uri.fsPath);
            const content = await vscode.workspace.fs.readFile(uri);
            await vscode.workspace.fs.writeFile(vscode.Uri.file(targetPath), content);
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(targetPath));
            await vscode.window.showTextDocument(doc);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    });
    context.subscriptions.push(copypaste);
}

export function deactivate() {}
