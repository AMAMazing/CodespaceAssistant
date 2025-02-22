    import * as vscode from 'vscode';

    export function activate(context: vscode.ExtensionContext) {

        console.log('Congratulations, your extension "codespace-assistant" is now active!');

        // Register the TreeDataProvider for the sidebar
        vscode.window.registerTreeDataProvider('codespaceAssistantView', new CodespaceAssistantDataProvider(context));

        let selectFileDisposable = vscode.commands.registerCommand('codespaceAssistantView.selectFile', async () => {
            // Get all files in the current working directory
            const files = await vscode.workspace.findFiles('**/*');

            // Create QuickPickItems from the file paths
            const items: vscode.QuickPickItem[] = files.map((file: vscode.Uri) => ({
                label: vscode.workspace.asRelativePath(file),
                description: file.fsPath
            }));

            // Show the QuickPick (dropdown)
            const selectedFile = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select a file',
            });

            if (selectedFile) {
                // Store the selected file path in extension context
                context.workspaceState.update('selectedFile', selectedFile.description);
                vscode.commands.executeCommand('codespaceAssistantView.refresh');
            }

        });

        let createFileDisposable = vscode.commands.registerCommand('codespace-assistant.createFile', async () => {
            const fileName = await vscode.window.showInputBox({
                prompt: 'Enter the new file name'
            });

            if (fileName) {
                const newFilePath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, fileName);
                try {
                    await vscode.workspace.fs.writeFile(newFilePath, new Uint8Array());
                    vscode.window.showInformationMessage(`File created: ${fileName}`);
                    // Refresh the tree view
                    vscode.commands.executeCommand('codespaceAssistantView.refresh');

                } catch (error: any) {
                    vscode.window.showErrorMessage(`Failed to create file: ${error.message}`);
                }
            }
        });


        let copyFileDisposable = vscode.commands.registerCommand('codespace-assistant.copyFile', async () => {
            const selectedFilePath = context.workspaceState.get('selectedFile');

            if (selectedFilePath && typeof selectedFilePath === 'string') {
                try {
                    const fileUri = vscode.Uri.file(selectedFilePath);
                    const document = await vscode.workspace.openTextDocument(fileUri);
                    await vscode.env.clipboard.writeText(document.getText());

                    vscode.window.showInformationMessage(`Copied contents of ${vscode.workspace.asRelativePath(fileUri)} to clipboard`);

                } catch (error: any) {
                    vscode.window.showErrorMessage(`Failed to copy file: ${error.message}`);
                }

            } else {
                vscode.window.showWarningMessage('No file selected to copy. Please select a file first.');
            }
        });

        let pasteToFileDisposable = vscode.commands.registerCommand('codespace-assistant.pasteToFile', async () => {
            const selectedFilePath = context.workspaceState.get('selectedFile');

            if (selectedFilePath && typeof selectedFilePath === 'string') {
                try {
                    const fileUri = vscode.Uri.file(selectedFilePath);
                    const clipboardContent = await vscode.env.clipboard.readText();
                    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(clipboardContent));

                    vscode.window.showInformationMessage(`Pasted content to ${vscode.workspace.asRelativePath(fileUri)}`);

                } catch (error: any) {
                    vscode.window.showErrorMessage(`Failed to paste to file: ${error.message}`);
                }
            } else {
                vscode.window.showWarningMessage('No file selected to paste to. Please select a file first.');
            }
        });

            let copyTerminalDisposable = vscode.commands.registerCommand('codespace-assistant.copyTerminal', async () => {
            try {
                await vscode.commands.executeCommand('workbench.action.terminal.copyLastCommandAndOutput');
                vscode.window.showInformationMessage('Copied last terminal command and output to clipboard.');

            } catch(error: any) {
                vscode.window.showErrorMessage(`Failed to copy terminal content ${error.message}`);
            }
        });

        let terminateTerminalDisposable = vscode.commands.registerCommand('codespace-assistant.terminateTerminal', async () => {
            try {
                await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { text: '\\x03' });
                vscode.window.showInformationMessage('Sent Ctrl+C to the active terminal.');
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to terminate terminal: ${error.message}`);
            }
        });

        let pasteAndRunDisposable = vscode.commands.registerCommand('codespace-assistant.pasteAndRun', async () => {
            try {
                const clipboardContent = await vscode.env.clipboard.readText();
                await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { text: clipboardContent + '\\r' });
                vscode.window.showInformationMessage('Pasted and ran command in active terminal.');

            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to paste and run in terminal: ${error.message}`);
            }
        });

        context.subscriptions.push(createFileDisposable, copyFileDisposable, pasteToFileDisposable, copyTerminalDisposable, terminateTerminalDisposable, pasteAndRunDisposable, selectFileDisposable);
    }

    export function deactivate() {}

    // Basic TreeDataProvider for the sidebar
    class CodespaceAssistantDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

        constructor(private context: vscode.ExtensionContext) {}

        private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
        readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

        refresh(): void {
            this._onDidChangeTreeData.fire();
        }

        getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
            return element;
        }

        async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
            if (element) {
                if (element.id === 'selectFileItem') {
                return [];
                }
                return [];
            } else {
                // Root level items
                const welcomeItem = new vscode.TreeItem('Welcome to Codespace Assistant', vscode.TreeItemCollapsibleState.None);

                const selectFileItem = new vscode.TreeItem('Select a file...', vscode.TreeItemCollapsibleState.None);
                selectFileItem.id = 'selectFileItem';
                selectFileItem.command = {
                    command: 'codespaceAssistantView.selectFile',
                    title: 'Select a File',
                };

                const createFileItem = new vscode.TreeItem('Create New File', vscode.TreeItemCollapsibleState.None);
                createFileItem.command = {
                    command: 'codespace-assistant.createFile',
                    title: 'Create New File'
                };
                const copyFileItem = new vscode.TreeItem('Copy Selected File', vscode.TreeItemCollapsibleState.None);
                copyFileItem.command = {
                    command: 'codespace-assistant.copyFile',
                    title: 'Copy Selected File'
                }

                const pasteFileItem = new vscode.TreeItem('Paste to Selected File', vscode.TreeItemCollapsibleState.None);
                pasteFileItem.command = {
                    command: 'codespace-assistant.pasteToFile',
                    title: 'Paste to Selected File'
                };

                const copyTerminalItem = new vscode.TreeItem('Copy Terminal Content', vscode.TreeItemCollapsibleState.None);
                copyTerminalItem.command = {
                    command: 'codespace-assistant.copyTerminal',
                    title: 'Copy Terminal Content'
                }

                const terminateTerminalItem = new vscode.TreeItem('Terminate Terminal', vscode.TreeItemCollapsibleState.None);
                terminateTerminalItem.command = {
                    command: 'codespace-assistant.terminateTerminal',
                    title: 'Terminate Terminal'
                }
                const pasteAndRunItem = new vscode.TreeItem('Paste and Run', vscode.TreeItemCollapsibleState.None);
                pasteAndRunItem.command = {
                    command: 'codespace-assistant.pasteAndRun',
                    title: 'Paste and Run'
                }
                return [welcomeItem, selectFileItem, createFileItem, copyFileItem, pasteFileItem, copyTerminalItem, terminateTerminalItem, pasteAndRunItem];
            }
        }
    }