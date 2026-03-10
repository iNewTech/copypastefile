import * as vscode from 'vscode';
import duplicateFile from './commands/duplicateFile';
import copyFileContentToClipboard from './commands/copyFileContentToClipboard';
import copyMultipleFilesForAI from './commands/copyMultipleFilesForAI';
import copyOpenEditorsForAI from './commands/copyOpenEditorsForAI';
import { createMoveFileTo, createCopyFileTo } from './commands/moveOrCopyFileTo';

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(
        vscode.commands.registerCommand('copypastefile.duplicateFile', duplicateFile)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('copypastefile.duplicateFolder', duplicateFile)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('copypastefile.copyFileContentToClipboard', copyFileContentToClipboard)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('copypastefile.copyMultipleFilesForAI', copyMultipleFilesForAI)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('copypastefile.copyOpenEditorsForAI', copyOpenEditorsForAI)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('copypastefile.moveFileTo', createMoveFileTo(context))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('copypastefile.copyFileTo', createCopyFileTo(context))
    );
}

export function deactivate() {}
