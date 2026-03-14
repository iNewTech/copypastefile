import * as assert from 'assert';
import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import copySelectionForAI from '../commands/copySelectionForAI';

suite('copySelectionForAI Test Suite', () => {
    const testFileName = 'test-selection.ts';
    const testFileContent = [
        'const first = 1;',
        'const second = 2;',
        'const total = first + second;',
        ''
    ].join('\n');
    let testRootUri: vscode.Uri;
    let testFileUri: vscode.Uri;
    let editor: vscode.TextEditor;

    suiteSetup(async () => {
        testRootUri = vscode.Uri.file(
            path.join(os.tmpdir(), `copypastefile-selection-${Date.now()}`)
        );
        await vscode.workspace.fs.createDirectory(testRootUri);
        testFileUri = vscode.Uri.joinPath(testRootUri, testFileName);
        await vscode.workspace.fs.writeFile(testFileUri, Buffer.from(testFileContent));
    });

    suiteTeardown(async () => {
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

        try {
            await vscode.workspace.fs.delete(testRootUri, { recursive: true });
        } catch {
            // ignore if already deleted
        }
    });

    setup(async () => {
        const document = await vscode.workspace.openTextDocument(testFileUri);
        editor = await vscode.window.showTextDocument(document);
        await vscode.env.clipboard.writeText('');
    });

    teardown(() => {
        sinon.restore();
    });

    test('should copy selected content into AI context format', async () => {
        const selectedLine = editor.document.lineAt(1).text;
        editor.selection = new vscode.Selection(
            new vscode.Position(1, 0),
            new vscode.Position(1, selectedLine.length)
        );

        await copySelectionForAI(editor);

        const clipboardContent = await vscode.env.clipboard.readText();
        assert.strictEqual(
            clipboardContent,
            [
                '# File Context',
                '',
                '## File Tree',
                `- ${testFileUri.fsPath}`,
                '',
                '---',
                '',
                `## file: ${testFileUri.fsPath} (selected line 2, cols 1-17)`,
                '```typescript',
                'const second = 2;',
                '```',
                ''
            ].join('\n')
        );
    });

    test('should append selected content to existing AI context', async () => {
        const existingContext = [
            '# File Context',
            '',
            '## File Tree',
            '- existing.ts',
            '',
            '---',
            '',
            '## file: existing.ts',
            '```typescript',
            'const existing = true;',
            '```'
        ].join('\n');
        await vscode.env.clipboard.writeText(existingContext);

        const selectedLine = editor.document.lineAt(2).text;
        editor.selection = new vscode.Selection(
            new vscode.Position(2, 0),
            new vscode.Position(2, selectedLine.length)
        );

        await copySelectionForAI(editor);

        const clipboardContent = await vscode.env.clipboard.readText();
        assert.strictEqual(
            clipboardContent,
            existingContext + '\n' + [
                '# File Context',
                '',
                '## File Tree',
                `- ${testFileUri.fsPath}`,
                '',
                '---',
                '',
                `## file: ${testFileUri.fsPath} (selected line 3, cols 1-29)`,
                '```typescript',
                'const total = first + second;',
                '```',
                ''
            ].join('\n')
        );
    });

    test('should show an error when selection is empty', async () => {
        const showErrorMessageStub = sinon.stub(vscode.window, 'showErrorMessage');
        editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 0)
        );

        await copySelectionForAI(editor);

        assert.strictEqual(showErrorMessageStub.calledOnce, true);
        assert.strictEqual(showErrorMessageStub.firstCall.args[0], 'Please select some content first.');
    });
});
