# Visual Studio Code C64 TurboAssembler

Visual Studio Code 6502 Turbo Assembler language support for Commodore 64 programs development.


## Requirements

  * [64tass](https://tass64.sourceforge.net/) assembler installed
  * [VICE](https://vice-emu.sourceforge.io/) emulator installed
  * [npm](https://www.npmjs.com/) package manager installed


## Extension compilation

  1. Install vsce: `npm install -g @vscode/vsce`
  2. Build package: `npm install`
  3. (Optional) Create extension: `vsce package`
  4. Install extension: `code --install-extension c64-turboassembler-1.0.0.vsix`
  5. Uninstall extension: `code --uninstall-extension c64-turboassembler-1.0.0.vsix`


## Usage

  * Press `F5` to compile and run source on any open `.asm` file.
  * Press `CTRL + SHIFT + I` to format assembly code. Labels should end with `:` to get better formatting.
