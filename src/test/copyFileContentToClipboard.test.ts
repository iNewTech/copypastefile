import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import copyFileContentToClipboard from '../commands/copyFileContentToClipboard';

suite('copyFileContentToClipboard Test Suite', () => {
    const testFileName = 'test-for-clipboard.txt';
    const testFileContent = 'hello clipboard';
    let testFileUri: vscode.Uri;
    const workspaceRoot = vscode.workspace.workspaceFolders![0].uri;

    suiteSetup(async () => {
        if (!vscode.workspace.workspaceFolders) {
            assert.fail('No workspace folder found');
        }
        testFileUri = vscode.Uri.joinPath(workspaceRoot, testFileName);
        await vscode.workspace.fs.writeFile(testFileUri, Buffer.from(testFileContent));
    });

    suiteTeardown(async () => {
        await vscode.workspace.fs.delete(testFileUri);
    });

    test('should copy file content to clipboard', async () => {
        await copyFileContentToClipboard(testFileUri);
        const clipboardContent = await vscode.env.clipboard.readText();
        assert.strictEqual(clipboardContent, testFileContent);
    });
});
