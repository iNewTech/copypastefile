import * as vscode from 'vscode';
import * as util from 'util';

function isBinary(content: Uint8Array): boolean {
    // Check for null bytes in the first 1024 bytes
    const checkLength = Math.min(content.length, 1024);
    for (let i = 0; i < checkLength; i++) {
        if (content[i] === 0) {
            return true;
        }
    }
    return false;
}

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
