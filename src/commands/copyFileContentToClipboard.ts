import * as vscode from 'vscode';

export default async function copyFileContentToClipboard(uri: vscode.Uri) {
    if (!uri) {
        vscode.window.showErrorMessage('Please select a file first');
        return;
    }

    try {
        const content = await vscode.workspace.fs.readFile(uri);
        await vscode.env.clipboard.writeText(content.toString());
        vscode.window.showInformationMessage('File content copied to clipboard.');
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}
