import * as assert from 'assert';
import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import copyFileContentToClipboard from '../commands/copyFileContentToClipboard';

suite('copyFileContentToClipboard Test Suite', () => {
    const testFileName = 'test-for-clipboard.txt';
    const testFileContent = 'hello clipboard';
    let testRootUri: vscode.Uri;
    let testFileUri: vscode.Uri;

    suiteSetup(async () => {
        testRootUri = vscode.Uri.file(
            path.join(os.tmpdir(), `copypastefile-copy-content-${Date.now()}`)
        );
        await vscode.workspace.fs.createDirectory(testRootUri);
        testFileUri = vscode.Uri.joinPath(testRootUri, testFileName);
        await vscode.workspace.fs.writeFile(testFileUri, Buffer.from(testFileContent));
    });

    suiteTeardown(async () => {
        try {
            await vscode.workspace.fs.delete(testRootUri, { recursive: true });
        } catch {
            // ignore if already deleted
        }
    });

    test('should copy file content to clipboard', async () => {
        await copyFileContentToClipboard(testFileUri);
        const clipboardContent = await vscode.env.clipboard.readText();
        assert.strictEqual(clipboardContent, testFileContent);
    });

    test('should not copy binary file content', async () => {
        const binaryFileName = 'test.bin';
        const binaryFileUri = vscode.Uri.joinPath(testRootUri, binaryFileName);
        // Create content with a null byte to simulate binary file
        const binaryContent = new Uint8Array([72, 101, 108, 108, 111, 0, 87, 111, 114, 108, 100]); // "Hello\0World"
        await vscode.workspace.fs.writeFile(binaryFileUri, binaryContent);

        const showErrorMessageStub = sinon.stub(vscode.window, 'showErrorMessage');

        try {
            await copyFileContentToClipboard(binaryFileUri);
            
            assert.strictEqual(showErrorMessageStub.calledOnce, true, 'showErrorMessage should be called once');
            assert.strictEqual(showErrorMessageStub.firstCall.args[0], 'Cannot copy binary file content to clipboard.');
        } finally {
            showErrorMessageStub.restore();
            await vscode.workspace.fs.delete(binaryFileUri);
        }
    });
});
