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
  const anyFile = uri.fsPath;
  const anyFileName = path.basename(anyFile);
  const anyFileDir = path.dirname(anyFile);
  const anyFileContent = fs.readFileSync(anyFile, "utf8");
  vscode.window.showInputBox({
    prompt: `Please enter new file name`,
    value: anyFileName
  }).then((newFileName) => {
    if (newFileName === void 0) {
      return;
    } else if (newFileName === "") {
      vscode.window.showErrorMessage(`Error: Blank file name not allowed`);
      return;
    } else if (newFileName === anyFileName) {
      vscode.window.showErrorMessage(`Error: New file name cannot be same as old file name`);
      return;
    } else if (!newFileName.includes(".yaml") && !newFileName.includes(".yml")) {
      newFileName = newFileName + ".yaml";
      if (newFileName === anyFileName) {
        vscode.window.showErrorMessage(`Error: New file name cannot be same as old file name`);
        return;
      }
    }
    const newFilePath = path.join(anyFileDir, newFileName);
    fs.writeFileSync(newFilePath, anyFileContent);
    vscode.workspace.openTextDocument(newFilePath).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  });
}

// src/extension.ts
function activate(context) {
  console.log('Congratulations, your extension "copypastefile" is now active!');
  let disposable = vscode2.commands.registerCommand("copypastefile.copyfile", async (uri) => {
    try {
      copyFile(uri);
    } catch (error) {
      vscode2.window.showErrorMessage(`Error: ${error.message}`);
    }
  });
  context.subscriptions.push(disposable);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
