import * as vscode from 'vscode';
import * as fs from 'fs';
import { dirname, normalize, basename } from 'path';
import * as f from 'file-url';

const DIR_PATH = normalize(`${dirname(require.main.filename)}/vs/workbench/`);
const FILE_PATH = normalize(`${DIR_PATH}/workbench.desktop.main.css`);
const BACKUP_PATH = normalize(`${DIR_PATH}/workbench.desktop.main.css.bak`);
const styles = normalize(__dirname+'/styles.css');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "nyancat" is now active!');
 
    //create backup file
    backup();
    // inject configuration
    injectCSS();

    const BAR_ITEM = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    updateConfig();
    BAR_ITEM.tooltip = "Nyan Cat";
    BAR_ITEM.show();

    // manual inject configuration command
    let refreshCMD = vscode.commands.registerCommand('extension.NyanCatRefresh', () => {
        updateConfig();
        vscode.window.showInformationMessage("Nyan Cat: refresh successful, reload Window to take effect.", 'Reload Window').then(msg => {
            msg === 'Reload Window' && vscode.commands.executeCommand("workbench.action.reloadWindow");
        });
    });


    // uninstall command
    let uninstallCMD = vscode.commands.registerCommand('extension.NyanCatUninstall', () => {
        prepareUninstall();
        vscode.window.showInformationMessage('Ready to uninstall Nyan Cat completed!');
        vscode.window.showInformationMessage("Nyan Cat: refresh successful, reload Window to take effect.", 'Reload Window').then(msg => {
            msg === 'Reload Window' && vscode.commands.executeCommand("workbench.action.reloadWindow");
        });
    });

    let rotateForwardCMD = vscode.commands.registerCommand('extension.NyanCatRotateForward', () => {
        rotateWordForward();
    });

    let rotateBackwardCMD = vscode.commands.registerCommand('extension.NyanCatRotateBackward', () => {
        rotateWordBackward();
    });

    context.subscriptions.push(refreshCMD);
    context.subscriptions.push(uninstallCMD);
    context.subscriptions.push(rotateForwardCMD);
    context.subscriptions.push(rotateBackwardCMD);


    // context.subscriptions.push(reloadCMD);

    function updateConfig() {
        var config = vscode.workspace.getConfiguration("NyanCat");
        if(config.name) {
            BAR_ITEM.text = `$(${config.name})`;
        }
    }

    function backup() {
        try {
            // fs.stat(BACKUP_PATH, (exists) => {
            //     if (exists === null) {
            //         fs.statSync(BACKUP_PATH);
            //     } else if (exists.code === 'ENOENT') {
            //         fs.writeFileSync(BACKUP_PATH, fs.readFileSync(FILE_PATH));
            //     }
            // });
            fs.statSync(BACKUP_PATH);
        } catch (err) {
            if (err) {
                fs.writeFileSync(BACKUP_PATH, fs.readFileSync(FILE_PATH));
            }
        }
    }



    function minifyCss(cssData: String) {
        return "";
    }

    function injectCSS() {
        let fileContent = fs.readFileSync(FILE_PATH, 'utf-8');

        //Minify css to get rid of vscode warning => "corrupt code"
        let inject = fs.readFileSync(styles, "utf-8");

        //Make Ajax req
        //curl -X POST -s --data-urlencode 'input@style.css' https://cssminifier.com/raw > style.min.css

        if (!fileContent.includes('codicon-nyan')) {
            fileContent = fileContent + 
            " " +
            inject;
            fs.writeFileSync(FILE_PATH, fileContent, 'utf-8');
        }
    }

    function scroll() {
        const window = vscode.window.onDidChangeTextEditorVisibleRanges(() => {

        });
    }

    function showActivity(config: any) {
        BAR_ITEM.text = `$(${config.name}) $(${config.name}) $(${config.name})`;
        setTimeout(() => {
            updateConfig();
        }, (3000));
    }

    function rotateWordForward() {
        const config = vscode.workspace.getConfiguration("NyanCat");
        const dict = config.dict;
        const editor = vscode.window.activeTextEditor;
        let wordRange = editor?.document.getWordRangeAtPosition(editor?.selection.start);
        let highlight = editor?.document.getText(wordRange);

        if (!highlight || !config) {
            return;
        }

        let newWord = "";
        for (let ar of dict) {
            let arr: Array<string> = ar;
            let idx = arr.indexOf(highlight!.toLowerCase());
            if (idx !== undefined && idx !== -1) {
                if (idx === arr.length-1){
                    newWord = arr[0];
                }else {
                    newWord = arr[idx + 1];
                }
            }
        };

        if (newWord === "") {
            return;
        }

        editor?.edit((editBuider) => {
            editBuider.replace(wordRange!, newWord);
        });

        if (config.name) {
            showActivity(config);
        }
    }

    function rotateWordBackward() {
        const config = vscode.workspace.getConfiguration("NyanCat");
        const dict = config.dict;
        const editor = vscode.window.activeTextEditor;
        let wordRange = editor?.document.getWordRangeAtPosition(editor?.selection.start);
        let highlight = editor?.document.getText(wordRange);

        if (!highlight || !config) {
            return;
        }

        let newWord = "";
        for (let ar of dict) {
            let arr: Array<string> = ar;
            let idx = arr.indexOf(highlight!.toLowerCase());
            if (idx !== undefined && idx !== -1) {
                if (idx === 0){
                    newWord = arr[arr.length-1];
                }else {
                    newWord = arr[idx - 1];
                }
            }
        };

        if (newWord === "") {
            return;
        }

        editor?.edit((editBuider) => {
            editBuider.replace(wordRange!, newWord);
        });
        
        if (config.name) {
            showActivity(config);
        }
    }

}

function prepareUninstall() {
    try{
        fs.statSync(BACKUP_PATH);
    } catch(e) {
        return;
    }
    fs.unlinkSync(FILE_PATH);
    fs.renameSync(BACKUP_PATH, FILE_PATH);
}

// this method is called when your extension is deactivated
export function deactivate() {}
