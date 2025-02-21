"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Congratulations, your extension "codespace-assistant" is now active!');
    // Register the TreeDataProvider for the sidebar
    vscode.window.registerTreeDataProvider('codespaceAssistantView', new CodespaceAssistantDataProvider());
    let disposable = vscode.commands.registerCommand('codespace-assistant.selectFile', async () => {
        const options = {
            canSelectMany: false,
            openLabel: 'Select File',
            canSelectFiles: true,
            canSelectFolders: false
        };
        vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) {
                vscode.window.showInformationMessage('Selected file: ' + fileUri[0].fsPath);
            }
        });
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
// Basic TreeDataProvider for the sidebar
class CodespaceAssistantDataProvider {
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            // Root level items
            const item = new vscode.TreeItem('Welcome to Codespace Assistant', vscode.TreeItemCollapsibleState.None);
            item.iconPath = new vscode.ThemeIcon("file-code");
            return Promise.resolve([item]);
        }
    }
}
//# sourceMappingURL=extension.js.map