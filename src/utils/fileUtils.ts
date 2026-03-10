import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Check if file content is binary by scanning for null bytes in the first 1024 bytes.
 */
export function isBinary(content: Uint8Array): boolean {
    const checkLength = Math.min(content.length, 1024);
    for (let i = 0; i < checkLength; i++) {
        if (content[i] === 0) {
            return true;
        }
    }
    return false;
}

/**
 * Map file extension to markdown language identifier for code fences.
 */
export function getLanguageId(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase().slice(1);
    const extensionMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'tsx',
        'js': 'javascript',
        'jsx': 'jsx',
        'py': 'python',
        'rb': 'ruby',
        'rs': 'rust',
        'go': 'go',
        'java': 'java',
        'kt': 'kotlin',
        'swift': 'swift',
        'cs': 'csharp',
        'cpp': 'cpp',
        'c': 'c',
        'h': 'c',
        'hpp': 'cpp',
        'css': 'css',
        'scss': 'scss',
        'less': 'less',
        'html': 'html',
        'xml': 'xml',
        'json': 'json',
        'yaml': 'yaml',
        'yml': 'yaml',
        'md': 'markdown',
        'sh': 'bash',
        'bash': 'bash',
        'zsh': 'bash',
        'sql': 'sql',
        'graphql': 'graphql',
        'gql': 'graphql',
        'dockerfile': 'dockerfile',
        'toml': 'toml',
        'ini': 'ini',
        'cfg': 'ini',
        'vue': 'vue',
        'svelte': 'svelte',
        'php': 'php',
        'lua': 'lua',
        'r': 'r',
        'dart': 'dart',
        'ex': 'elixir',
        'exs': 'elixir',
        'erl': 'erlang',
        'hs': 'haskell',
        'scala': 'scala',
        'tf': 'hcl',
        'proto': 'protobuf',
    };
    return extensionMap[ext] || ext || 'text';
}

/**
 * Get the workspace-relative path for a URI.
 * Falls back to the full fsPath if no workspace folder contains it.
 */
export function getRelativePath(uri: vscode.Uri): string {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
        return path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
    }
    return uri.fsPath;
}

const SKIP_DIRS = new Set([
    'node_modules', '.git', '.svn', '.hg', 'dist', 'build',
    'out', '.next', '.nuxt', '__pycache__', '.venv', 'venv',
    'coverage', '.cache'
]);

/**
 * Recursively collect all file URIs under a directory.
 * Skips common non-content directories.
 */
export async function collectFilesRecursively(uri: vscode.Uri): Promise<vscode.Uri[]> {
    const results: vscode.Uri[] = [];
    const entries = await vscode.workspace.fs.readDirectory(uri);

    for (const [name, type] of entries) {
        const childUri = vscode.Uri.joinPath(uri, name);
        if (type === vscode.FileType.Directory) {
            if (!SKIP_DIRS.has(name) && !name.startsWith('.')) {
                const nested = await collectFilesRecursively(childUri);
                results.push(...nested);
            }
        } else if (type === vscode.FileType.File) {
            results.push(childUri);
        }
    }

    return results;
}
