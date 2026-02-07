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
var vscode3 = __toESM(require("vscode"));

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
var vscode2 = __toESM(require("vscode"));
function isBinary(content) {
  const checkLength = Math.min(content.length, 1024);
  for (let i = 0; i < checkLength; i++) {
    if (content[i] === 0) {
      return true;
    }
  }
  return false;
}
async function copyFileContentToClipboard(uri) {
  if (!uri) {
    vscode2.window.showErrorMessage("Please select a file first");
    return;
  }
  try {
    const content = await vscode2.workspace.fs.readFile(uri);
    if (isBinary(content)) {
      vscode2.window.showErrorMessage("Cannot copy binary file content to clipboard.");
      return;
    }
    const text = new TextDecoder().decode(content);
    await vscode2.env.clipboard.writeText(text);
    vscode2.window.showInformationMessage("File content copied to clipboard.");
  } catch (error) {
    vscode2.window.showErrorMessage(`Error: ${error.message}`);
  }
}

// src/extension.ts
function activate(context) {
  context.subscriptions.push(
    vscode3.commands.registerCommand("copypastefile.duplicateFile", duplicateFile)
  );
  context.subscriptions.push(
    vscode3.commands.registerCommand("copypastefile.duplicateFolder", duplicateFile)
  );
  context.subscriptions.push(
    vscode3.commands.registerCommand("copypastefile.copyFileContentToClipboard", copyFileContentToClipboard)
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
