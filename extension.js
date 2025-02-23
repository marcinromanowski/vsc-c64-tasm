"use strict";

const vscode = require("vscode");

const hoverProvider = require("./client/helpTexts/hoverProvider");
const compile = require("./client/commands/compile");
const run = require("./client/commands/run");
const AsmDefinitionProvider = require("./client/definitionProvider");

function activate(context) {

  vscode.languages.registerHoverProvider({ scheme: "*", language: "turboassembler" }, hoverProvider);

  const commands = {
    "tasm-c64.build": () => run(compile())
  };

  const toCommand = ([command, callback]) => vscode.commands.registerCommand(command, callback);
  Object.entries(commands)
    .map(toCommand)
    .forEach((command) => context.subscriptions.push(command));

  const disposable = vscode.languages.registerDocumentFormattingEditProvider(
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

          if (/^\w+:\s*$/.test(newText)) {
            //newText = newText.trim(); // Bez wcięć
          } else {
            //newText = newIndent + newText;
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

  const definitionProvider = vscode.languages.registerDefinitionProvider(
    { language: "turboassembler" },
    new AsmDefinitionProvider()
  );

  context.subscriptions.push(definitionProvider);
}

exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;
