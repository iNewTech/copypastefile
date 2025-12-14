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
  const baseFile = uri.fsPath;
  const baseFileName = path.basename(baseFile);
  const baseFileExt = path.extname(baseFileName);
  const baseFileNameWithoutExt = path.basename(baseFile, path.extname(baseFile));
  const baseFileDir = path.dirname(baseFile);
  let counter = 0;
  let newFileNameSuggestion;
  while (true) {
    if (counter === 0) {
      newFileNameSuggestion = `${baseFileNameWithoutExt}_copy${baseFileExt}`;
    } else {
      newFileNameSuggestion = `${baseFileNameWithoutExt}_copy_${counter}${baseFileExt}`;
    }
    const newFilePath2 = path.join(baseFileDir, newFileNameSuggestion);
    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(newFilePath2));
      counter++;
    } catch {
      break;
    }
  }
  const newFileName = await vscode.window.showInputBox({
    prompt: `Please enter new file name`,
    value: newFileNameSuggestion
  });
  if (newFileName === void 0 || newFileName === "") {
    return;
  }
  const newFilePath = path.join(baseFileDir, newFileName);
  try {
    await vscode.workspace.fs.stat(vscode.Uri.file(newFilePath));
    vscode.window.showErrorMessage(`File already exists: ${newFileName}`);
    return;
  } catch {
  }
  try {
    const content = await vscode.workspace.fs.readFile(uri);
    await vscode.workspace.fs.writeFile(vscode.Uri.file(newFilePath), content);
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(newFilePath));
    await vscode.window.showTextDocument(doc);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}

// src/commands/copyFileContentToClipboard.ts
var vscode2 = __toESM(require("vscode"));
async function copyFileContentToClipboard(uri) {
  if (!uri) {
    vscode2.window.showErrorMessage("Please select a file first");
    return;
  }
  try {
    const content = await vscode2.workspace.fs.readFile(uri);
    await vscode2.env.clipboard.writeText(content.toString());
    vscode2.window.showInformationMessage("File content copied to clipboard.");
  } catch (error) {
    vscode2.window.showErrorMessage(`Error: ${error.message}`);
  }
}

// src/extension.ts
function activate(context) {
  vscode3.window.showInformationMessage("Copy Paste File extension is ready!");
  context.subscriptions.push(
    vscode3.commands.registerCommand("copypastefile.duplicateFile", duplicateFile)
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
