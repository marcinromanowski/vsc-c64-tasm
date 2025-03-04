"use strict";

import { commands as _commands, languages, TextEdit, window } from "vscode";
import { exec } from 'child_process';
import { dirname, extname, basename, join } from 'path';

//const hoverProvider = require("./helpTexts/hoverProvider");
import AsmDefinitionProvider from "./definitionProvider";

function activate(context) {

  //vscode.languages.registerHoverProvider({ scheme: "*", language: "turboassembler" }, hoverProvider);

  const commands = {
    "tass-c64.build": () => alert('ok') //run(compile())
  };

  const toCommand = ([command, callback]) => _commands.registerCommand(command, callback);
  Object.entries(commands)
    .map(toCommand)
    .forEach((command) => context.subscriptions.push(command));

  let disposable = languages.registerDocumentFormattingEditProvider(
    { language: "turboassembler" },
    {
      provideDocumentFormattingEdits(document) {

        const edits = [];
        let indentLevel = 0;
        const indentChar = "\t";
        const labels = [];

        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);

          let newText = line.text.trim();

          let newIndent;
          if (newText.startsWith("*")) {
            newIndent = indentChar.repeat(0);

          } else {

            if (labels.length > 0) {
              let lastLabel = labels[labels.length - 1];
              if (newText.endsWith(lastLabel)) {
                labels.pop();
                indentLevel--;
                if (indentLevel < 0) {
                  indentLevel = 0;
                }
              }
            }
            newIndent = indentChar.repeat(indentLevel);
          }

          if (line.text.trim() !== '') {
            newText = newIndent + newText;
          }

          if (newText !== line.text) {
            edits.push(TextEdit.replace(line.range, newText));
          }

          if (newText.startsWith("*")) {
            indentLevel = 1;
          } else {
            if (newText.endsWith(':')) {
              labels.push(newText.substring(0, newText.length - 1).trim());
              indentLevel++;
            }

            if (newText.toLowerCase().endsWith('rti') || newText.toLowerCase().endsWith('rts')) {
              indentLevel--;
            }
          }
        }

        return edits;
      },
    }
  );

  context.subscriptions.push(disposable);


  disposable = _commands.registerCommand('turboassembler.compileAndRun', function () {
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage("Brak otwartego pliku!");
      return;
    }

    const filePath = editor.document.fileName;
    const fileDir = dirname(filePath);
    const fileExt = extname(filePath);
    const sourceFile = basename(filePath);
    const binaryFile = sourceFile.replace(fileExt, '.prg');
    const exeFile = join(fileDir, `${binaryFile}`);

    exec(`64tass -C -a -i "${sourceFile}" -o "${binaryFile}"`, { cwd: fileDir }, (error, stdout, stderr) => {
      if (error) {
        window.showErrorMessage(`Compilation error: ${stderr}`);
        return;
      }

      exec(`x64 "${binaryFile}"`, { cwd: fileDir }, (err, out, errOut) => {
        if (err) {
          window.showErrorMessage(`Run error: ${errOut}`);
        }

        /*
        setTimeout(() => {
          if (fs.existsSync(exeFile)) {
            fs.unlink(exeFile, (unlinkErr) => {
              if (unlinkErr) {
                vscode.window.showErrorMessage(`Nie udało się usunąć pliku: ${unlinkErr.message}`);
              } else {
                vscode.window.showInformationMessage(`Plik ${exeFile} usunięty.`);
              }
            });
          } else {
            vscode.window.showErrorMessage(`Nie udało się usunąć pliku: ${exeFile}`);
          }
        }, 2000);
        */
      });
    });
  });

  context.subscriptions.push(disposable);


  const definitionProvider = languages.registerDefinitionProvider(
    { language: "turboassembler" },
    new AsmDefinitionProvider()
  );
  
  context.subscriptions.push(definitionProvider);
}


function deactivate() { }


const _activate = activate;
export { _activate as activate };
const _deactivate = deactivate;
export { _deactivate as deactivate };
