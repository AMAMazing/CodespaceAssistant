import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "codespace-assistant" is now active!');

    // Register the TreeDataProvider for the sidebar
    vscode.window.registerTreeDataProvider('codespaceAssistantView', new CodespaceAssistantDataProvider());

	let disposable = vscode.commands.registerCommand('codespace-assistant.selectFile', async () => {
        const options: vscode.OpenDialogOptions = {
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

export function deactivate() {}

// Basic TreeDataProvider for the sidebar
class CodespaceAssistantDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            // Root level items
            const item = new vscode.TreeItem('Welcome to Codespace Assistant', vscode.TreeItemCollapsibleState.None);
            item.iconPath = new vscode.ThemeIcon("file-code");
            return Promise.resolve([item]);
        }
    }
}
