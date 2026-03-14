"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode8 = __toESM(require("vscode"));

// src/commands/duplicateFile.ts
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));
async function duplicateFile(uri) {
  if (!uri) {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      uri = activeEditor.document.uri;
    } else {
      vscode.window.showErrorMessage("Please select a resource to duplicate.");
      return;
    }
  }
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    const isDirectory = (stat.type & vscode.FileType.Directory) !== 0;
    const baseFileDir = path.dirname(uri.fsPath);
    const baseName = path.basename(uri.fsPath);
    const newNameSuggestion = await getUniqueName(baseFileDir, baseName);
    const extIndex = newNameSuggestion.lastIndexOf(".");
    const selectionEnd = extIndex > 0 ? extIndex : newNameSuggestion.length;
    const newName = await vscode.window.showInputBox({
      prompt: `Enter name for duplicated ${isDirectory ? "folder" : "file"}`,
      value: newNameSuggestion,
      valueSelection: [0, selectionEnd]
    });
    if (!newName) {
      return;
    }
    const newFilePath = path.join(baseFileDir, newName);
    const newUri = vscode.Uri.file(newFilePath);
    try {
      await vscode.workspace.fs.stat(newUri);
      vscode.window.showErrorMessage(`${isDirectory ? "Folder" : "File"} already exists: ${newName}`);
      return;
    } catch {
    }
    await vscode.workspace.fs.copy(uri, newUri, { overwrite: false });
    if (!isDirectory) {
      const doc = await vscode.workspace.openTextDocument(newUri);
      await vscode.window.showTextDocument(doc);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error duplicating resource: ${error.message}`);
  }
}
async function getUniqueName(dirPath, oldName) {
  const ext = path.extname(oldName);
  const nameWithoutExt = path.basename(oldName, ext);
  let counter = 0;
  while (true) {
    const suffix = counter === 0 ? "_copy" : `_copy_${counter}`;
    const candidate = `${nameWithoutExt}${suffix}${ext}`;
    const candidatePath = vscode.Uri.file(path.join(dirPath, candidate));
    try {
      await vscode.workspace.fs.stat(candidatePath);
      counter++;
    } catch {
      return candidate;
    }
  }
}

// src/commands/copyFileContentToClipboard.ts
var vscode3 = __toESM(require("vscode"));

// src/utils/fileUtils.ts
var vscode2 = __toESM(require("vscode"));
var path2 = __toESM(require("path"));
function isBinary(content) {
  const checkLength = Math.min(content.length, 1024);
  for (let i = 0; i < checkLength; i++) {
    if (content[i] === 0) {
      return true;
    }
  }
  return false;
}
function getLanguageId(filePath) {
  const ext = path2.extname(filePath).toLowerCase().slice(1);
  const extensionMap = {
    "ts": "typescript",
    "tsx": "tsx",
    "js": "javascript",
    "jsx": "jsx",
    "py": "python",
    "rb": "ruby",
    "rs": "rust",
    "go": "go",
    "java": "java",
    "kt": "kotlin",
    "swift": "swift",
    "cs": "csharp",
    "cpp": "cpp",
    "c": "c",
    "h": "c",
    "hpp": "cpp",
    "css": "css",
    "scss": "scss",
    "less": "less",
    "html": "html",
    "xml": "xml",
    "json": "json",
    "yaml": "yaml",
    "yml": "yaml",
    "md": "markdown",
    "sh": "bash",
    "bash": "bash",
    "zsh": "bash",
    "sql": "sql",
    "graphql": "graphql",
    "gql": "graphql",
    "dockerfile": "dockerfile",
    "toml": "toml",
    "ini": "ini",
    "cfg": "ini",
    "vue": "vue",
    "svelte": "svelte",
    "php": "php",
    "lua": "lua",
    "r": "r",
    "dart": "dart",
    "ex": "elixir",
    "exs": "elixir",
    "erl": "erlang",
    "hs": "haskell",
    "scala": "scala",
    "tf": "hcl",
    "proto": "protobuf"
  };
  return extensionMap[ext] || ext || "text";
}
function getRelativePath(uri) {
  const workspaceFolder = vscode2.workspace.getWorkspaceFolder(uri);
  if (workspaceFolder) {
    return path2.relative(workspaceFolder.uri.fsPath, uri.fsPath);
  }
  return uri.fsPath;
}
var SKIP_DIRS = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  ".svn",
  ".hg",
  "dist",
  "build",
  "out",
  ".next",
  ".nuxt",
  "__pycache__",
  ".venv",
  "venv",
  "coverage",
  ".cache"
]);
async function collectFilesRecursively(uri) {
  const results = [];
  const entries = await vscode2.workspace.fs.readDirectory(uri);
  for (const [name, type] of entries) {
    const childUri = vscode2.Uri.joinPath(uri, name);
    if (type === vscode2.FileType.Directory) {
      if (!SKIP_DIRS.has(name) && !name.startsWith(".")) {
        const nested = await collectFilesRecursively(childUri);
        results.push(...nested);
      }
    } else if (type === vscode2.FileType.File) {
      results.push(childUri);
    }
  }
  return results;
}

// src/commands/copyFileContentToClipboard.ts
async function copyFileContentToClipboard(uri) {
  if (!uri) {
    vscode3.window.showErrorMessage("Please select a file first");
    return;
  }
  try {
    const content = await vscode3.workspace.fs.readFile(uri);
    if (isBinary(content)) {
      vscode3.window.showErrorMessage("Cannot copy binary file content to clipboard.");
      return;
    }
    const text = new TextDecoder().decode(content);
    await vscode3.env.clipboard.writeText(text);
    vscode3.window.showInformationMessage("File content copied to clipboard.");
  } catch (error) {
    vscode3.window.showErrorMessage(`Error: ${error.message}`);
  }
}

// src/commands/copyMultipleFilesForAI.ts
var vscode4 = __toESM(require("vscode"));

// src/utils/aiContext.ts
var FILE_CONTEXT_HEADER = "# File Context";
function trimTrailingNewline(text) {
  return text.endsWith("\n") ? text.slice(0, -1) : text;
}
function buildAIContextBlock(relativePaths, contentSections, header = FILE_CONTEXT_HEADER) {
  const parts = [];
  parts.push(`${header}
`);
  parts.push("## File Tree");
  for (const relativePath of relativePaths) {
    parts.push(`- ${relativePath}`);
  }
  parts.push("\n---\n");
  parts.push(contentSections.join("\n"));
  return parts.join("\n");
}
function buildFileContextSection(relativePath, text, language, descriptor) {
  const heading = descriptor ? `## file: ${relativePath} (${descriptor})` : `## file: ${relativePath}`;
  return `${heading}
\`\`\`${language}
${trimTrailingNewline(text)}
\`\`\`
`;
}
function buildSkippedFileContextSection(relativePath, message) {
  return `## file: ${relativePath}
> [${message}]
`;
}
function appendAIContextBlock(existingClipboardText, newBlock, header = FILE_CONTEXT_HEADER) {
  if (existingClipboardText.includes(header)) {
    return {
      output: existingClipboardText.trimEnd() + "\n" + newBlock,
      appended: true
    };
  }
  return {
    output: newBlock,
    appended: false
  };
}

// src/commands/copyMultipleFilesForAI.ts
var MAX_FILE_SIZE = 512 * 1024;
async function copyMultipleFilesForAI(uri, selectedUris) {
  const uris = selectedUris && selectedUris.length > 0 ? selectedUris : uri ? [uri] : [];
  if (uris.length === 0) {
    vscode4.window.showErrorMessage("Please select one or more files or folders.");
    return;
  }
  try {
    const allFileUris = [];
    for (const u of uris) {
      const stat = await vscode4.workspace.fs.stat(u);
      if ((stat.type & vscode4.FileType.Directory) !== 0) {
        const nested = await collectFilesRecursively(u);
        allFileUris.push(...nested);
      } else {
        allFileUris.push(u);
      }
    }
    if (allFileUris.length === 0) {
      vscode4.window.showInformationMessage("No files found in the selected items.");
      return;
    }
    allFileUris.sort(
      (a, b) => getRelativePath(a).localeCompare(getRelativePath(b))
    );
    const relativePaths = [];
    const contentSections = [];
    let copiedCount = 0;
    let skippedBinary = 0;
    let skippedLarge = 0;
    for (const fileUri of allFileUris) {
      const rp = getRelativePath(fileUri);
      const stat = await vscode4.workspace.fs.stat(fileUri);
      if (stat.size > MAX_FILE_SIZE) {
        const sizeMB = (stat.size / (1024 * 1024)).toFixed(1);
        relativePaths.push(rp);
        contentSections.push(
          buildSkippedFileContextSection(rp, `File too large: ${sizeMB} MB - skipped`)
        );
        skippedLarge++;
        continue;
      }
      const content = await vscode4.workspace.fs.readFile(fileUri);
      if (isBinary(content)) {
        relativePaths.push(rp);
        contentSections.push(buildSkippedFileContextSection(rp, "Binary file skipped"));
        skippedBinary++;
        continue;
      }
      const text = new TextDecoder().decode(content);
      const lang = getLanguageId(fileUri.fsPath);
      relativePaths.push(rp);
      const section = buildFileContextSection(rp, text, lang);
      contentSections.push(section);
      copiedCount++;
    }
    const newBlock = buildAIContextBlock(relativePaths, contentSections);
    const existing = await vscode4.env.clipboard.readText();
    const { output, appended } = appendAIContextBlock(existing, newBlock);
    await vscode4.env.clipboard.writeText(output);
    const msgs = [`${copiedCount} file(s) added to AI context.`];
    if (skippedBinary > 0) {
      msgs.push(`${skippedBinary} binary file(s) skipped.`);
    }
    if (skippedLarge > 0) {
      msgs.push(`${skippedLarge} large file(s) skipped.`);
    }
    if (appended) {
      msgs.push("(Appended to existing context)");
    }
    vscode4.window.showInformationMessage(msgs.join(" "));
  } catch (error) {
    vscode4.window.showErrorMessage(`Error copying files: ${error.message}`);
  }
}

// src/commands/copyOpenEditorsForAI.ts
var vscode5 = __toESM(require("vscode"));
async function copyOpenEditorsForAI() {
  const openDocs = vscode5.workspace.textDocuments.filter(
    (doc) => doc.uri.scheme === "file" && !doc.isUntitled
  );
  if (openDocs.length === 0) {
    vscode5.window.showInformationMessage("No open files to copy.");
    return;
  }
  try {
    const sorted = [...openDocs].sort(
      (a, b) => getRelativePath(a.uri).localeCompare(getRelativePath(b.uri))
    );
    const relativePaths = [];
    const contentSections = [];
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
      "# File Context (Open Editors)"
    );
    await vscode5.env.clipboard.writeText(output);
    vscode5.window.showInformationMessage(
      `${copiedCount} open editor(s) copied for AI context.`
    );
  } catch (error) {
    vscode5.window.showErrorMessage(`Error copying open editors: ${error.message}`);
  }
}

// src/commands/copySelectionForAI.ts
var vscode6 = __toESM(require("vscode"));
function getDocumentLabel(document) {
  if (document.uri.scheme === "file") {
    return getRelativePath(document.uri);
  }
  return document.fileName || document.uri.toString();
}
function describeSelection(selection) {
  const startLine = selection.start.line + 1;
  const endLine = selection.end.character === 0 && selection.end.line > selection.start.line ? selection.end.line : selection.end.line + 1;
  if (startLine === endLine) {
    const startColumn = selection.start.character + 1;
    const endColumn = selection.end.character;
    return `selected line ${startLine}, cols ${startColumn}-${endColumn}`;
  }
  return `selected lines ${startLine}-${endLine}`;
}
async function copySelectionForAI(editor) {
  const activeEditor = editor ?? vscode6.window.activeTextEditor;
  if (!activeEditor) {
    vscode6.window.showErrorMessage("Please open a text editor and select content first.");
    return;
  }
  if (activeEditor.selection.isEmpty) {
    vscode6.window.showErrorMessage("Please select some content first.");
    return;
  }
  try {
    const document = activeEditor.document;
    const selectedText = document.getText(activeEditor.selection);
    const relativePath = getDocumentLabel(document);
    const language = getLanguageId(document.fileName || document.uri.fsPath);
    const descriptor = describeSelection(activeEditor.selection);
    const newBlock = buildAIContextBlock(
      [relativePath],
      [buildFileContextSection(relativePath, selectedText, language, descriptor)]
    );
    const existing = await vscode6.env.clipboard.readText();
    const { output, appended } = appendAIContextBlock(existing, newBlock);
    await vscode6.env.clipboard.writeText(output);
    vscode6.window.showInformationMessage(
      appended ? "Selected content copied for AI context. (Appended to existing context)" : "Selected content copied for AI context."
    );
  } catch (error) {
    vscode6.window.showErrorMessage(`Error copying selection: ${error.message}`);
  }
}

// src/commands/moveOrCopyFileTo.ts
var vscode7 = __toESM(require("vscode"));
var path3 = __toESM(require("path"));
var SKIP_DIRS2 = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  ".svn",
  ".hg",
  "dist",
  "build",
  "out",
  ".next",
  ".nuxt",
  "__pycache__",
  ".venv",
  "venv",
  "coverage",
  ".cache"
]);
var MAX_DEPTH = 10;
var RECENT_KEY = "copypastefile.recentDestinations";
var MAX_RECENT = 5;
async function collectFolders(rootUri, depth = 0) {
  if (depth >= MAX_DEPTH) {
    return [];
  }
  const results = [];
  let entries;
  try {
    entries = await vscode7.workspace.fs.readDirectory(rootUri);
  } catch {
    return results;
  }
  for (const [name, type] of entries) {
    if (type === vscode7.FileType.Directory && !SKIP_DIRS2.has(name) && !name.startsWith(".")) {
      const childUri = vscode7.Uri.joinPath(rootUri, name);
      results.push(childUri);
      const nested = await collectFolders(childUri, depth + 1);
      results.push(...nested);
    }
  }
  return results;
}
function createMoveFileTo(context) {
  return (uri) => moveOrCopyFileTo(uri, "move", context);
}
function createCopyFileTo(context) {
  return (uri) => moveOrCopyFileTo(uri, "copy", context);
}
async function moveOrCopyFileTo(uri, mode, context) {
  if (!uri) {
    const activeEditor = vscode7.window.activeTextEditor;
    if (activeEditor) {
      uri = activeEditor.document.uri;
    } else {
      vscode7.window.showErrorMessage("Please select a file or folder first.");
      return;
    }
  }
  const workspaceFolders = vscode7.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode7.window.showErrorMessage("No workspace folder open.");
    return;
  }
  try {
    const folderUris = await vscode7.window.withProgress(
      {
        location: vscode7.ProgressLocation.Notification,
        title: "Scanning workspace folders...",
        cancellable: false
      },
      async () => {
        const allFolders = [];
        for (const wf of workspaceFolders) {
          allFolders.push(wf.uri);
          const nested = await collectFolders(wf.uri);
          allFolders.push(...nested);
        }
        return allFolders;
      }
    );
    const items = [];
    items.push({
      label: "$(new-folder) Create New Folder...",
      description: "Type a new folder path",
      isCreateNew: true,
      alwaysShow: true
    });
    const recentPaths = context.workspaceState.get(RECENT_KEY, []);
    if (recentPaths.length > 0) {
      items.push({
        label: "Recently Used",
        kind: vscode7.QuickPickItemKind.Separator
      });
      for (const rp of recentPaths) {
        const folderUri = vscode7.Uri.file(rp);
        try {
          await vscode7.workspace.fs.stat(folderUri);
          const label = getRelativeLabel(folderUri);
          items.push({
            label: `$(folder) ${label}`,
            description: "(recent)",
            folderUri
          });
        } catch {
        }
      }
      items.push({
        label: "All Folders",
        kind: vscode7.QuickPickItemKind.Separator
      });
    }
    for (const folderUri of folderUris) {
      const label = getRelativeLabel(folderUri);
      items.push({
        label: `$(folder) ${label}`,
        folderUri
      });
    }
    const actionLabel = mode === "move" ? "Move" : "Copy";
    const baseName = path3.basename(uri.fsPath);
    const picked = await vscode7.window.showQuickPick(items, {
      placeHolder: `${actionLabel} "${baseName}" to...`,
      matchOnDescription: true
    });
    if (!picked) {
      return;
    }
    let destinationFolderUri;
    if (picked.isCreateNew) {
      const newPath = await vscode7.window.showInputBox({
        prompt: "Enter folder path (relative to workspace root)",
        placeHolder: "e.g., src/components/new-folder"
      });
      if (!newPath) {
        return;
      }
      destinationFolderUri = vscode7.Uri.joinPath(workspaceFolders[0].uri, newPath);
      await vscode7.workspace.fs.createDirectory(destinationFolderUri);
    } else if (picked.folderUri) {
      destinationFolderUri = picked.folderUri;
    } else {
      return;
    }
    const destinationUri = vscode7.Uri.joinPath(destinationFolderUri, baseName);
    let finalDestinationUri = destinationUri;
    try {
      await vscode7.workspace.fs.stat(destinationUri);
      const resolution = await vscode7.window.showQuickPick(
        [
          { label: "Overwrite", description: "Replace the existing file" },
          { label: "Auto-rename", description: "Save as a new name" },
          { label: "Cancel", description: "Abort the operation" }
        ],
        { placeHolder: `"${baseName}" already exists at destination. What would you like to do?` }
      );
      if (!resolution || resolution.label === "Cancel") {
        return;
      }
      if (resolution.label === "Auto-rename") {
        finalDestinationUri = await getUniqueDestination(destinationFolderUri, baseName);
      }
    } catch {
    }
    const overwrite = finalDestinationUri.fsPath === destinationUri.fsPath;
    if (mode === "move") {
      await vscode7.workspace.fs.rename(uri, finalDestinationUri, { overwrite });
    } else {
      await vscode7.workspace.fs.copy(uri, finalDestinationUri, { overwrite });
    }
    const updatedRecent = [
      destinationFolderUri.fsPath,
      ...recentPaths.filter((p) => p !== destinationFolderUri.fsPath)
    ].slice(0, MAX_RECENT);
    await context.workspaceState.update(RECENT_KEY, updatedRecent);
    const stat = await vscode7.workspace.fs.stat(finalDestinationUri);
    const isDirectory = (stat.type & vscode7.FileType.Directory) !== 0;
    vscode7.window.showInformationMessage(
      `${mode === "move" ? "Moved" : "Copied"} "${baseName}" to ${getRelativeLabel(destinationFolderUri)}`
    );
    if (!isDirectory) {
      const doc = await vscode7.workspace.openTextDocument(finalDestinationUri);
      await vscode7.window.showTextDocument(doc);
    }
  } catch (error) {
    vscode7.window.showErrorMessage(`Error: ${error.message}`);
  }
}
function getRelativeLabel(folderUri) {
  const wf = vscode7.workspace.getWorkspaceFolder(folderUri);
  if (wf) {
    const rel = path3.relative(wf.uri.fsPath, folderUri.fsPath);
    return rel || wf.name;
  }
  return folderUri.fsPath;
}
async function getUniqueDestination(folderUri, baseName) {
  const ext = path3.extname(baseName);
  const nameWithoutExt = path3.basename(baseName, ext);
  let counter = 0;
  while (true) {
    const suffix = counter === 0 ? "_copy" : `_copy_${counter}`;
    const candidate = `${nameWithoutExt}${suffix}${ext}`;
    const candidateUri = vscode7.Uri.joinPath(folderUri, candidate);
    try {
      await vscode7.workspace.fs.stat(candidateUri);
      counter++;
    } catch {
      return candidateUri;
    }
  }
}

// src/extension.ts
function activate(context) {
  context.subscriptions.push(
    vscode8.commands.registerCommand("copypastefile.duplicateFile", duplicateFile)
  );
  context.subscriptions.push(
    vscode8.commands.registerCommand("copypastefile.duplicateFolder", duplicateFile)
  );
  context.subscriptions.push(
    vscode8.commands.registerCommand("copypastefile.copyFileContentToClipboard", copyFileContentToClipboard)
  );
  context.subscriptions.push(
    vscode8.commands.registerCommand("copypastefile.copyMultipleFilesForAI", copyMultipleFilesForAI)
  );
  context.subscriptions.push(
    vscode8.commands.registerCommand("copypastefile.copyOpenEditorsForAI", copyOpenEditorsForAI)
  );
  context.subscriptions.push(
    vscode8.commands.registerTextEditorCommand("copypastefile.copySelectionForAI", async (editor) => {
      await copySelectionForAI(editor);
    })
  );
  context.subscriptions.push(
    vscode8.commands.registerCommand("copypastefile.moveFileTo", createMoveFileTo(context))
  );
  context.subscriptions.push(
    vscode8.commands.registerCommand("copypastefile.copyFileTo", createCopyFileTo(context))
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
