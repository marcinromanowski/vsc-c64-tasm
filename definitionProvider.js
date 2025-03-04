import { Location } from 'vscode';

class AsmDefinitionProvider {
    provideDefinition(document, position, token) {
        const wordRange = document.getWordRangeAtPosition(position, /\b[a-zA-Z_][a-zA-Z0-9_]*\b/);
        if (!wordRange) {
            return;
        }

        const word = document.getText(wordRange);
        const text = document.getText();
        const regex = new RegExp(`^\\s*(${word})\\s*:`, 'gm');
        let match;
        while ((match = regex.exec(text)) !== null) {
            const startPosition = document.positionAt(match.index);
            return new Location(document.uri, startPosition);
        }

        return;
    }
}

export default AsmDefinitionProvider;
