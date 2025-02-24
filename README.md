# Visual Studio Code C64 TurbAssembler

Visual Studio Code 6502 assembly language support for C64 development with Turbo Assembler.


## Requirements

  * [64tass](https://tass64.sourceforge.net/) assembler installed
  * [VICE](https://vice-emu.sourceforge.io/) emulator installed
  * npm installed


## Extension compilation

  1. Install vsce: `npm install -g @vscode/vsce`
  2. Build package: `npm install`
  3. Create extension: `vsce package`
  4. Install extension: `code --install-extension c64-turboassembler-1.0.0.vsix`
  5. Uninstall extension: `code --uninstall-extension c64-turboassembler-1.0.0.vsix`