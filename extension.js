"use strict";

const vscode = require("vscode");
const cp = require('child_process');
const path = require('path');

const AsmDefinitionProvider = require("./definitionProvider");

let diagnosticCollection;


function activate(context) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('turboassembler');
  context.subscriptions.push(diagnosticCollection);

  let disposable = vscode.languages.registerDocumentFormattingEditProvider(
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
            edits.push(vscode.TextEdit.replace(line.range, newText));
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


  disposable = vscode.commands.registerCommand('turboassembler.compileAndRun', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("Brak otwartego pliku!");
      return;
    }

    const document = editor.document;
    const filePath = document.fileName;
    const fileDir = path.dirname(filePath);
    const fileExt = path.extname(filePath);
    const sourceFile = path.basename(filePath);
    const binaryFile = sourceFile.replace(fileExt, '.prg');
    const exeFile = path.join(fileDir, `${binaryFile}`);

    diagnosticCollection.clear();

    cp.exec(`64tass -C -a -i "${sourceFile}" -o "${binaryFile}"`, { cwd: fileDir }, (error, stdout, stderr) => {
      if (error) {
        processCompilerErrors(document, stderr);
        return;
      }


      cp.exec(`x64 "${binaryFile}"`, { cwd: fileDir }, (err, out, errOut) => {
        if (err) {
          processCompilerErrors(document, stderr);
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


  const definitionProvider = vscode.languages.registerDefinitionProvider(
    { language: "turboassembler" },
    new AsmDefinitionProvider()
  );

  context.subscriptions.push(definitionProvider);

  const hoverProvider = vscode.languages.registerHoverProvider('turboassembler', {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position);
      const word = range ? document.getText(range) : '';

      return new vscode.Hover(`**Information about:** ${word}`);
    }
  });

  //context.subscriptions.push(hoverProvider);
}


function processCompilerErrors(document, stderr) {
  const diagnostics = [];

  let lineNumber = 1;
  let errorDescription = stderr;

  const match = stderr.match(/([^:]+):(\d+):\d+: error: (.+)/);
  if (match) {
    lineNumber = parseInt(match[2], 10); // 246
    errorDescription = stderr;

  }

  const range = new vscode.Range(lineNumber, 0, lineNumber - 1, 100);
  const diagnostic = new vscode.Diagnostic(
    range,
    errorDescription,
    vscode.DiagnosticSeverity.Error
  );
  diagnostics.push(diagnostic);

  diagnosticCollection.set(document.uri, diagnostics);
}


function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}


exports.activate = activate;
exports.deactivate = deactivate;
