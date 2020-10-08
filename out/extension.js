"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path_1 = require("path");
//import { ThemeConfig, getConfigValue, CSS_LEFT, CSS_TOP } from '../config/config';
const DIR_PATH = path_1.normalize(`${path_1.dirname(require.main.filename)}/vs/workbench/`);
const FILE_PATH = path_1.normalize(`${DIR_PATH}/workbench.desktop.main.css`);
const BACKUP_PATH = path_1.normalize(`${DIR_PATH}/workbench.desktop.main.css.bak`);
const styles = path_1.normalize(__dirname + '/styles.css');
const BATMAN_STYLE = path_1.normalize(__dirname + '/batman.css');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
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
        if (config.name) {
            BAR_ITEM.text = `$(${config.name})`;
        }
        if (config.batman_mode) {
            injectBatmanCSS();
        }
        else {
            ejectBatmanCSS();
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
        }
        catch (err) {
            if (err) {
                fs.writeFileSync(BACKUP_PATH, fs.readFileSync(FILE_PATH));
            }
        }
    }
    function minifyCss(cssData) {
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
    function injectBatmanCSS() {
        let fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
        let inject = fs.readFileSync(BATMAN_STYLE, "utf-8");
        if (!fileContent.includes('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGB')) {
            fileContent = fileContent +
                " " +
                inject;
            fs.writeFileSync(FILE_PATH, fileContent, 'utf-8');
        }
    }
    function ejectBatmanCSS() {
        let fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
        let inject = fs.readFileSync(BATMAN_STYLE, "utf-8");
        if (fileContent.includes('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGB')) {
            fileContent = fileContent.replace(inject, '');
            fs.writeFileSync(FILE_PATH, fileContent, 'utf-8');
        }
    }
    function scroll() {
        const window = vscode.window.onDidChangeTextEditorVisibleRanges(() => {
        });
    }
    function showActivity(config) {
        BAR_ITEM.text = `$(${config.name}) $(${config.name}) $(${config.name})`;
        setTimeout(() => {
            updateConfig();
        }, (3000));
    }
    function rotateWordForward() {
        const config = vscode.workspace.getConfiguration("NyanCat");
        const dict = config.dict;
        const editor = vscode.window.activeTextEditor;
        let wordRange = editor === null || editor === void 0 ? void 0 : editor.document.getWordRangeAtPosition(editor === null || editor === void 0 ? void 0 : editor.selection.start);
        let highlight = editor === null || editor === void 0 ? void 0 : editor.document.getText(wordRange);
        if (!highlight || !config) {
            return;
        }
        let newWord = "";
        for (let ar of dict) {
            let arr = ar;
            let idx = arr.indexOf(highlight.toLowerCase());
            if (idx !== undefined && idx !== -1) {
                if (idx === arr.length - 1) {
                    newWord = arr[0];
                }
                else {
                    newWord = arr[idx + 1];
                }
            }
        }
        ;
        if (newWord === "") {
            return;
        }
        editor === null || editor === void 0 ? void 0 : editor.edit((editBuider) => {
            editBuider.replace(wordRange, newWord);
        });
        if (config.name) {
            showActivity(config);
        }
    }
    function rotateWordBackward() {
        const config = vscode.workspace.getConfiguration("NyanCat");
        const dict = config.dict;
        const editor = vscode.window.activeTextEditor;
        let wordRange = editor === null || editor === void 0 ? void 0 : editor.document.getWordRangeAtPosition(editor === null || editor === void 0 ? void 0 : editor.selection.start);
        let highlight = editor === null || editor === void 0 ? void 0 : editor.document.getText(wordRange);
        if (!highlight || !config) {
            return;
        }
        let newWord = "";
        for (let ar of dict) {
            let arr = ar;
            let idx = arr.indexOf(highlight.toLowerCase());
            if (idx !== undefined && idx !== -1) {
                if (idx === 0) {
                    newWord = arr[arr.length - 1];
                }
                else {
                    newWord = arr[idx - 1];
                }
            }
        }
        ;
        if (newWord === "") {
            return;
        }
        editor === null || editor === void 0 ? void 0 : editor.edit((editBuider) => {
            editBuider.replace(wordRange, newWord);
        });
        if (config.name) {
            showActivity(config);
        }
    }
}
exports.activate = activate;
function prepareUninstall() {
    try {
        fs.statSync(BACKUP_PATH);
        fs.unlinkSync(FILE_PATH);
        fs.renameSync(BACKUP_PATH, FILE_PATH);
    }
    catch (e) {
        return;
    }
}
// this method is called when your extension is deactivated
function deactivate() {
    prepareUninstall();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map