import * as vscode from 'vscode';
import { getLanguageId, getRelativePath } from '../utils/fileUtils';
import { buildAIContextBlock, buildFileContextSection } from '../utils/aiContext';

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

        const relativePaths: string[] = [];
        const contentSections: string[] = [];
        let copiedCount = 0;
        for (const doc of sorted) {
            const rp = getRelativePath(doc.uri);
            const text = doc.getText();
            const lang = getLanguageId(doc.uri.fsPath);

            relativePaths.push(rp);
            contentSections.push(buildFileContextSection(rp, text, lang));
            copiedCount++;
        }

        const output = buildAIContextBlock(
            relativePaths,
            contentSections,
            '# File Context (Open Editors)'
        );
        await vscode.env.clipboard.writeText(output);
        vscode.window.showInformationMessage(
            `${copiedCount} open editor(s) copied for AI context.`
        );
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error copying open editors: ${error.message}`);
    }
}
