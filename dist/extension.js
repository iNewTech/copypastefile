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
var vscode2 = __toESM(require("vscode"));

// src/copy-file.ts
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
function copyFile(uri) {
  const baseFile = uri.fsPath;
  const baseFileName = path.basename(baseFile);
  const baseFileNameWithoutExt = path.basename(baseFile, path.extname(baseFile));
  const baseFileDir = path.dirname(baseFile);
  const baseFileContent = fs.readFileSync(baseFile, "utf8");
  const baseFileExt = path.extname(baseFileName);
  vscode.window.showInputBox({
    prompt: `Please enter new file name`,
    value: baseFileName
  }).then((newFileName) => {
    if (newFileName === void 0) {
      return;
    } else if (newFileName === "") {
      vscode.window.showErrorMessage(`Error: Blank file name not allowed`);
      return;
    } else if (newFileName === baseFileName || newFileName === baseFileNameWithoutExt) {
      vscode.window.showErrorMessage(`Error: New file name cannot be same as old file name - ${newFileName}`);
      newFileName = newFileName + "_copy";
    } else {
      if (!newFileName.includes(".")) {
        newFileName = newFileName + baseFileExt;
      }
    }
    const newFilePath = path.join(baseFileDir, newFileName);
    fs.writeFileSync(newFilePath, baseFileContent);
    vscode.workspace.openTextDocument(newFilePath).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  });
}
function getTargetPath(sourcePath) {
  const dir = path.dirname(sourcePath);
  const ext = path.extname(sourcePath);
  const base = path.basename(sourcePath, ext);
  let counter = 1;
  let targetPath;
  do {
    targetPath = path.join(dir, `${base}_copy_${counter}${ext}`);
    counter++;
  } while (fs.existsSync(targetPath));
  return targetPath;
}

// src/extension.ts
function activate(context) {
  vscode2.window.showInformationMessage("Copy Paste File extension is ready!");
  const disposable = vscode2.commands.registerCommand("copypastefile.copyfile", async (uri) => {
    if (!uri) {
      vscode2.window.showErrorMessage("Please select a file first");
      return;
    }
    try {
      await copyFile(uri);
    } catch (error) {
      vscode2.window.showErrorMessage(`Error: ${error.message}`);
    }
  });
  context.subscriptions.push(disposable);
  const copypaste = vscode2.commands.registerCommand("copypastefile.copypaste", async (uri) => {
    if (!uri) {
      vscode2.window.showErrorMessage("Please select a file first");
      return;
    }
    try {
      const targetPath = getTargetPath(uri.fsPath);
      const content = await vscode2.workspace.fs.readFile(uri);
      await vscode2.workspace.fs.writeFile(vscode2.Uri.file(targetPath), content);
      const doc = await vscode2.workspace.openTextDocument(vscode2.Uri.file(targetPath));
      await vscode2.window.showTextDocument(doc);
    } catch (error) {
      vscode2.window.showErrorMessage(`Error: ${error.message}`);
    }
  });
  context.subscriptions.push(copypaste);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
