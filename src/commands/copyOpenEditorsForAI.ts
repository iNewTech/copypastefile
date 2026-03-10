import * as vscode from 'vscode';
import { getLanguageId, getRelativePath } from '../utils/fileUtils';

export default async function copyOpenEditorsForAI() {
    const openDocs = vscode.workspace.textDocuments.filter(doc =>
        doc.uri.scheme === 'file' && !doc.isUntitled
    );

    if (openDocs.length === 0) {
        vscode.window.showInformationMessage('No open files to copy.');
        return;
    }

    try {
        // Sort by relative path
        const sorted = [...openDocs].sort((a, b) =>
            getRelativePath(a.uri).localeCompare(getRelativePath(b.uri))
        );

        const parts: string[] = [];
        parts.push('# File Context (Open Editors)\n');
        parts.push('## File Tree');
        for (const doc of sorted) {
            parts.push(`- ${getRelativePath(doc.uri)}`);
        }
        parts.push('\n---\n');

        let copiedCount = 0;
        for (const doc of sorted) {
            const rp = getRelativePath(doc.uri);
            const text = doc.getText();
            const lang = getLanguageId(doc.uri.fsPath);

            parts.push(`## file: ${rp}`);
            parts.push('```' + lang);
            parts.push(text.endsWith('\n') ? text.slice(0, -1) : text);
            parts.push('```\n');
            copiedCount++;
        }

        const output = parts.join('\n');
        await vscode.env.clipboard.writeText(output);
        vscode.window.showInformationMessage(
            `${copiedCount} open editor(s) copied for AI context.`
        );
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error copying open editors: ${error.message}`);
    }
}
