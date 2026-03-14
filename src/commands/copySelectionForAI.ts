import * as vscode from 'vscode';
import { getLanguageId, getRelativePath } from '../utils/fileUtils';
import {
    appendAIContextBlock,
    buildAIContextBlock,
    buildFileContextSection
} from '../utils/aiContext';

function getDocumentLabel(document: vscode.TextDocument): string {
    if (document.uri.scheme === 'file') {
        return getRelativePath(document.uri);
    }

    return document.fileName || document.uri.toString();
}

function describeSelection(selection: vscode.Selection): string {
    const startLine = selection.start.line + 1;
    const endLine = selection.end.character === 0 && selection.end.line > selection.start.line
        ? selection.end.line
        : selection.end.line + 1;

    if (startLine === endLine) {
        const startColumn = selection.start.character + 1;
        const endColumn = selection.end.character;
        return `selected line ${startLine}, cols ${startColumn}-${endColumn}`;
    }

    return `selected lines ${startLine}-${endLine}`;
}

export default async function copySelectionForAI(editor?: vscode.TextEditor) {
    const activeEditor = editor ?? vscode.window.activeTextEditor;

    if (!activeEditor) {
        vscode.window.showErrorMessage('Please open a text editor and select content first.');
        return;
    }

    if (activeEditor.selection.isEmpty) {
        vscode.window.showErrorMessage('Please select some content first.');
        return;
    }

    try {
        const document = activeEditor.document;
        const selectedText = document.getText(activeEditor.selection);
        const relativePath = getDocumentLabel(document);
        const language = getLanguageId(document.fileName || document.uri.fsPath);
        const descriptor = describeSelection(activeEditor.selection);

        const newBlock = buildAIContextBlock(
            [relativePath],
            [buildFileContextSection(relativePath, selectedText, language, descriptor)]
        );

        const existing = await vscode.env.clipboard.readText();
        const { output, appended } = appendAIContextBlock(existing, newBlock);

        await vscode.env.clipboard.writeText(output);
        vscode.window.showInformationMessage(
            appended
                ? 'Selected content copied for AI context. (Appended to existing context)'
                : 'Selected content copied for AI context.'
        );
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error copying selection: ${error.message}`);
    }
}
