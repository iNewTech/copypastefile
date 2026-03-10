import * as vscode from 'vscode';
import { isBinary, getLanguageId, getRelativePath, collectFilesRecursively } from '../utils/fileUtils';

const MAX_FILE_SIZE = 512 * 1024; // 512 KB

export default async function copyMultipleFilesForAI(
    uri: vscode.Uri,
    selectedUris?: vscode.Uri[]
) {
    const uris = (selectedUris && selectedUris.length > 0) ? selectedUris : uri ? [uri] : [];

    if (uris.length === 0) {
        vscode.window.showErrorMessage('Please select one or more files or folders.');
        return;
    }

    try {
        // Resolve all URIs: expand folders, keep files
        const allFileUris: vscode.Uri[] = [];
        for (const u of uris) {
            const stat = await vscode.workspace.fs.stat(u);
            if ((stat.type & vscode.FileType.Directory) !== 0) {
                const nested = await collectFilesRecursively(u);
                allFileUris.push(...nested);
            } else {
                allFileUris.push(u);
            }
        }

        if (allFileUris.length === 0) {
            vscode.window.showInformationMessage('No files found in the selected items.');
            return;
        }

        // Sort by relative path for consistent ordering
        allFileUris.sort((a, b) =>
            getRelativePath(a).localeCompare(getRelativePath(b))
        );

        // Build file tree section
        const relativePaths = allFileUris.map(u => getRelativePath(u));
        const parts: string[] = [];
        parts.push('# File Context\n');
        parts.push('## File Tree');
        for (const rp of relativePaths) {
            parts.push(`- ${rp}`);
        }
        parts.push('\n---\n');

        // Build content sections
        let copiedCount = 0;
        let skippedBinary = 0;
        let skippedLarge = 0;

        for (const fileUri of allFileUris) {
            const rp = getRelativePath(fileUri);
            const stat = await vscode.workspace.fs.stat(fileUri);

            if (stat.size > MAX_FILE_SIZE) {
                const sizeMB = (stat.size / (1024 * 1024)).toFixed(1);
                parts.push(`## file: ${rp}`);
                parts.push(`> [File too large: ${sizeMB} MB - skipped]\n`);
                skippedLarge++;
                continue;
            }

            const content = await vscode.workspace.fs.readFile(fileUri);

            if (isBinary(content)) {
                parts.push(`## file: ${rp}`);
                parts.push(`> [Binary file skipped]\n`);
                skippedBinary++;
                continue;
            }

            const text = new TextDecoder().decode(content);
            const lang = getLanguageId(fileUri.fsPath);

            parts.push(`## file: ${rp}`);
            parts.push('```' + lang);
            parts.push(text.endsWith('\n') ? text.slice(0, -1) : text);
            parts.push('```\n');
            copiedCount++;
        }

        const output = parts.join('\n');
        await vscode.env.clipboard.writeText(output);

        // Build summary message
        const msgs: string[] = [`${copiedCount} file(s) copied for AI context.`];
        if (skippedBinary > 0) {
            msgs.push(`${skippedBinary} binary file(s) skipped.`);
        }
        if (skippedLarge > 0) {
            msgs.push(`${skippedLarge} large file(s) skipped.`);
        }
        vscode.window.showInformationMessage(msgs.join(' '));

    } catch (error: any) {
        vscode.window.showErrorMessage(`Error copying files: ${error.message}`);
    }
}
