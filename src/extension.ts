import * as vscode from 'vscode';
import duplicateFile from './commands/duplicateFile';
import copyFileContentToClipboard from './commands/copyFileContentToClipboard';

export function activate(context: vscode.ExtensionContext) {

    vscode.window.showInformationMessage('Copy Paste File extension is ready!');
    
    context.subscriptions.push(
        vscode.commands.registerCommand('copypastefile.duplicateFile', duplicateFile)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('copypastefile.copyFileContentToClipboard', copyFileContentToClipboard)
    );
}

export function deactivate() {}
