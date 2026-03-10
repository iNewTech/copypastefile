import * as vscode from 'vscode';
import { isBinary } from '../utils/fileUtils';

export default async function copyFileContentToClipboard(uri: vscode.Uri) {
    if (!uri) {
        vscode.window.showErrorMessage('Please select a file first');
        return;
    }

    try {
        const content = await vscode.workspace.fs.readFile(uri);

        if (isBinary(content)) {
            vscode.window.showErrorMessage('Cannot copy binary file content to clipboard.');
            return;
        }

        const text = new TextDecoder().decode(content);
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('File content copied to clipboard.');
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}
