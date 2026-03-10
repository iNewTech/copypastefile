import * as vscode from 'vscode';
import * as path from 'path';

interface FolderItem extends vscode.QuickPickItem {
    folderUri?: vscode.Uri;
    isCreateNew?: boolean;
}

const SKIP_DIRS = new Set([
    'node_modules', '.git', '.svn', '.hg', 'dist', 'build',
    'out', '.next', '.nuxt', '__pycache__', '.venv', 'venv',
    'coverage', '.cache'
]);

const MAX_DEPTH = 10;
const RECENT_KEY = 'copypastefile.recentDestinations';
const MAX_RECENT = 5;

async function collectFolders(rootUri: vscode.Uri, depth: number = 0): Promise<vscode.Uri[]> {
    if (depth >= MAX_DEPTH) { return []; }

    const results: vscode.Uri[] = [];
    let entries: [string, vscode.FileType][];
    try {
        entries = await vscode.workspace.fs.readDirectory(rootUri);
    } catch {
        return results;
    }

    for (const [name, type] of entries) {
        if (type === vscode.FileType.Directory && !SKIP_DIRS.has(name) && !name.startsWith('.')) {
            const childUri = vscode.Uri.joinPath(rootUri, name);
            results.push(childUri);
            const nested = await collectFolders(childUri, depth + 1);
            results.push(...nested);
        }
    }

    return results;
}

export function createMoveFileTo(context: vscode.ExtensionContext) {
    return (uri: vscode.Uri) => moveOrCopyFileTo(uri, 'move', context);
}

export function createCopyFileTo(context: vscode.ExtensionContext) {
    return (uri: vscode.Uri) => moveOrCopyFileTo(uri, 'copy', context);
}

async function moveOrCopyFileTo(
    uri: vscode.Uri,
    mode: 'move' | 'copy',
    context: vscode.ExtensionContext
) {
    if (!uri) {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            uri = activeEditor.document.uri;
        } else {
            vscode.window.showErrorMessage('Please select a file or folder first.');
            return;
        }
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder open.');
        return;
    }

    try {
        // Scan workspace folders with progress
        const folderUris = await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Scanning workspace folders...',
                cancellable: false
            },
            async () => {
                const allFolders: vscode.Uri[] = [];
                for (const wf of workspaceFolders) {
                    allFolders.push(wf.uri);
                    const nested = await collectFolders(wf.uri);
                    allFolders.push(...nested);
                }
                return allFolders;
            }
        );

        // Build Quick Pick items
        const items: FolderItem[] = [];

        // Create new folder option
        items.push({
            label: '$(new-folder) Create New Folder...',
            description: 'Type a new folder path',
            isCreateNew: true,
            alwaysShow: true
        });

        // Recent destinations
        const recentPaths: string[] = context.workspaceState.get(RECENT_KEY, []);
        if (recentPaths.length > 0) {
            items.push({
                label: 'Recently Used',
                kind: vscode.QuickPickItemKind.Separator
            });
            for (const rp of recentPaths) {
                const folderUri = vscode.Uri.file(rp);
                try {
                    await vscode.workspace.fs.stat(folderUri);
                    const label = getRelativeLabel(folderUri);
                    items.push({
                        label: `$(folder) ${label}`,
                        description: '(recent)',
                        folderUri
                    });
                } catch {
                    // Folder no longer exists, skip
                }
            }

            items.push({
                label: 'All Folders',
                kind: vscode.QuickPickItemKind.Separator
            });
        }

        // All workspace folders
        for (const folderUri of folderUris) {
            const label = getRelativeLabel(folderUri);
            items.push({
                label: `$(folder) ${label}`,
                folderUri
            });
        }

        // Show Quick Pick
        const actionLabel = mode === 'move' ? 'Move' : 'Copy';
        const baseName = path.basename(uri.fsPath);
        const picked = await vscode.window.showQuickPick(items, {
            placeHolder: `${actionLabel} "${baseName}" to...`,
            matchOnDescription: true
        });

        if (!picked) { return; }

        let destinationFolderUri: vscode.Uri;

        if (picked.isCreateNew) {
            const newPath = await vscode.window.showInputBox({
                prompt: 'Enter folder path (relative to workspace root)',
                placeHolder: 'e.g., src/components/new-folder'
            });
            if (!newPath) { return; }

            destinationFolderUri = vscode.Uri.joinPath(workspaceFolders[0].uri, newPath);
            await vscode.workspace.fs.createDirectory(destinationFolderUri);
        } else if (picked.folderUri) {
            destinationFolderUri = picked.folderUri;
        } else {
            return;
        }

        // Build destination URI
        const destinationUri = vscode.Uri.joinPath(destinationFolderUri, baseName);

        // Check for conflicts
        let finalDestinationUri = destinationUri;
        try {
            await vscode.workspace.fs.stat(destinationUri);
            // File exists -- ask user
            const resolution = await vscode.window.showQuickPick(
                [
                    { label: 'Overwrite', description: 'Replace the existing file' },
                    { label: 'Auto-rename', description: 'Save as a new name' },
                    { label: 'Cancel', description: 'Abort the operation' }
                ],
                { placeHolder: `"${baseName}" already exists at destination. What would you like to do?` }
            );

            if (!resolution || resolution.label === 'Cancel') { return; }

            if (resolution.label === 'Auto-rename') {
                finalDestinationUri = await getUniqueDestination(destinationFolderUri, baseName);
            }
        } catch {
            // No conflict
        }

        // Perform the operation
        const overwrite = finalDestinationUri.fsPath === destinationUri.fsPath;
        if (mode === 'move') {
            await vscode.workspace.fs.rename(uri, finalDestinationUri, { overwrite });
        } else {
            await vscode.workspace.fs.copy(uri, finalDestinationUri, { overwrite });
        }

        // Update recent destinations
        const updatedRecent = [
            destinationFolderUri.fsPath,
            ...recentPaths.filter(p => p !== destinationFolderUri.fsPath)
        ].slice(0, MAX_RECENT);
        await context.workspaceState.update(RECENT_KEY, updatedRecent);

        // Show success and open file if applicable
        const stat = await vscode.workspace.fs.stat(finalDestinationUri);
        const isDirectory = (stat.type & vscode.FileType.Directory) !== 0;

        vscode.window.showInformationMessage(
            `${mode === 'move' ? 'Moved' : 'Copied'} "${baseName}" to ${getRelativeLabel(destinationFolderUri)}`
        );

        if (!isDirectory) {
            const doc = await vscode.workspace.openTextDocument(finalDestinationUri);
            await vscode.window.showTextDocument(doc);
        }

    } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}

function getRelativeLabel(folderUri: vscode.Uri): string {
    const wf = vscode.workspace.getWorkspaceFolder(folderUri);
    if (wf) {
        const rel = path.relative(wf.uri.fsPath, folderUri.fsPath);
        return rel || wf.name;
    }
    return folderUri.fsPath;
}

async function getUniqueDestination(folderUri: vscode.Uri, baseName: string): Promise<vscode.Uri> {
    const ext = path.extname(baseName);
    const nameWithoutExt = path.basename(baseName, ext);
    let counter = 0;

    while (true) {
        const suffix = counter === 0 ? '_copy' : `_copy_${counter}`;
        const candidate = `${nameWithoutExt}${suffix}${ext}`;
        const candidateUri = vscode.Uri.joinPath(folderUri, candidate);
        try {
            await vscode.workspace.fs.stat(candidateUri);
            counter++;
        } catch {
            return candidateUri;
        }
    }
}
