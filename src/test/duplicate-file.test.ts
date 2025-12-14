import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as sinon from 'sinon';
import duplicateFile from '../commands/duplicateFile';

suite('duplicateFile Test Suite', () => {
    const testFileName = 'test.txt';
    const testFileContent = 'hello world';
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

    test('should duplicate file with a new name', async () => {
        const newFileName = 'test_copy.txt';
        const showInputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves(newFileName);
        
        await duplicateFile(testFileUri);

        const newFileUri = vscode.Uri.joinPath(workspaceRoot, newFileName);
        const newFileContent = await vscode.workspace.fs.readFile(newFileUri);
        assert.strictEqual(newFileContent.toString(), testFileContent);

        await vscode.workspace.fs.delete(newFileUri);
        showInputBoxStub.restore();
    });

    test('should suggest a new name if the default copy name already exists', async () => {
        const firstCopyName = 'test_copy.txt';
        const firstCopyUri = vscode.Uri.joinPath(workspaceRoot, firstCopyName);
        await vscode.workspace.fs.writeFile(firstCopyUri, Buffer.from('another content'));

        const secondCopyName = 'test_copy_1.txt';
        const showInputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves(secondCopyName);

        await duplicateFile(testFileUri);

        const newFileUri = vscode.Uri.joinPath(workspaceRoot, secondCopyName);
        const newFileContent = await vscode.workspace.fs.readFile(newFileUri);
        assert.strictEqual(newFileContent.toString(), testFileContent);

        await vscode.workspace.fs.delete(firstCopyUri);
        await vscode.workspace.fs.delete(newFileUri);
        showInputBoxStub.restore();
    });
});
