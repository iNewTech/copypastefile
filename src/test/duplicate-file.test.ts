import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as sinon from 'sinon';
import duplicateFile from '../commands/duplicateFile';

suite('Duplicate Resource Test Suite', () => {
    const workspaceRoot = vscode.workspace.workspaceFolders![0].uri;
    
    // --- File Tests ---
    suite('File Duplication', () => {
        const testFileName = 'test_file.txt';
        const testFileContent = 'hello world';
        let testFileUri: vscode.Uri;

        setup(async () => {
            testFileUri = vscode.Uri.joinPath(workspaceRoot, testFileName);
            await vscode.workspace.fs.writeFile(testFileUri, Buffer.from(testFileContent));
        });

        teardown(async () => {
            try {
                await vscode.workspace.fs.delete(testFileUri);
            } catch {}
        });

        test('should duplicate a file with a new name', async () => {
            const newFileName = 'test_file_copy.txt';
            const showInputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves(newFileName);
            
            try {
                await duplicateFile(testFileUri);

                const newFileUri = vscode.Uri.joinPath(workspaceRoot, newFileName);
                const newFileContent = await vscode.workspace.fs.readFile(newFileUri);
                assert.strictEqual(newFileContent.toString(), testFileContent);
                
                // Cleanup
                await vscode.workspace.fs.delete(newFileUri);
            } finally {
                showInputBoxStub.restore();
            }
        });

        test('should suggest valid name if default exists', async () => {
            // Setup: Create "test_file_copy.txt" beforehand
            const existingCopyName = 'test_file_copy.txt';
            const existingCopyUri = vscode.Uri.joinPath(workspaceRoot, existingCopyName);
            await vscode.workspace.fs.writeFile(existingCopyUri, Buffer.from('existing'));

            // Expectation: Suggest "test_file_copy_1.txt"
            const expectedSuggestion = 'test_file_copy_1.txt';
            
            const showInputBoxStub = sinon.stub(vscode.window, 'showInputBox').callsFake(async (options) => {
                assert.strictEqual(options?.value, expectedSuggestion, 'Should suggest incremented name');
                return expectedSuggestion;
            });

            try {
                await duplicateFile(testFileUri);
                
                const newFileUri = vscode.Uri.joinPath(workspaceRoot, expectedSuggestion);
                const stat = await vscode.workspace.fs.stat(newFileUri);
                assert.ok(stat, 'New file should exist');

                // Cleanup
                await vscode.workspace.fs.delete(newFileUri);
            } finally {
                showInputBoxStub.restore();
                await vscode.workspace.fs.delete(existingCopyUri);
            }
        });
    });

    // --- Folder Tests ---
    suite('Folder Duplication', () => {
        const testFolderName = 'test_folder';
        const nestedFileName = 'nested.txt';
        let testFolderUri: vscode.Uri;

        setup(async () => {
            testFolderUri = vscode.Uri.joinPath(workspaceRoot, testFolderName);
            await vscode.workspace.fs.createDirectory(testFolderUri);
            
            // Create a file inside the folder to test recursion
            const nestedFileUri = vscode.Uri.joinPath(testFolderUri, nestedFileName);
            await vscode.workspace.fs.writeFile(nestedFileUri, Buffer.from('nested content'));
        });

        teardown(async () => {
            try {
                await vscode.workspace.fs.delete(testFolderUri, { recursive: true });
            } catch {}
        });

        test('should duplicate a folder recursively', async () => {
            const newFolderName = 'test_folder_copy';
            const showInputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves(newFolderName);

            try {
                await duplicateFile(testFolderUri);

                const newFolderUri = vscode.Uri.joinPath(workspaceRoot, newFolderName);
                const newStat = await vscode.workspace.fs.stat(newFolderUri);
                assert.strictEqual((newStat.type & vscode.FileType.Directory) !== 0, true, 'Should be a directory');

                // Check nested file
                const newNestedFileUri = vscode.Uri.joinPath(newFolderUri, nestedFileName);
                const content = await vscode.workspace.fs.readFile(newNestedFileUri);
                assert.strictEqual(content.toString(), 'nested content', 'Nested content should be preserved');

                // Cleanup
                await vscode.workspace.fs.delete(newFolderUri, { recursive: true });
            } finally {
                showInputBoxStub.restore();
            }
        });
    });
});
