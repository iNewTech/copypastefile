// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import copyFile, { getTargetPath } from "./copy-file";
import * as fs from "fs";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "copypastefile" is now active!');

	// let disposable = vscode.commands.registerCommand('copypastefile.copyfile', async (uri:vscode.Uri) => {
	// 	try {
	// 		copyFile(uri);
	// 	} catch (error: any) {
	// 		vscode.window.showErrorMessage(`Error: ${error.message}`);
	// 	}
	// });

	// context.subscriptions.push(disposable);

    let disposable = vscode.commands.registerCommand('copypastefile.copyfile', (uri: vscode.Uri) => {
        const sourcePath = uri.fsPath;
        const targetPath = getTargetPath(sourcePath);

        fs.copyFile(sourcePath, targetPath, (err) => {
            if (err) {
                vscode.window.showErrorMessage(`Failed to copy file: ${err.message}`);
            } else {
                vscode.window.showInformationMessage(`File copied to ${targetPath}`);
            }
        });
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
