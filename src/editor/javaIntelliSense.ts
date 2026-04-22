import * as monaco from 'monaco-editor';

const JAVA_KEYWORDS = [
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
  'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
  'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
  'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
  'volatile', 'while', 'true', 'false', 'null'
];

const JAVA_SNIPPETS = [
  { label: 'sout', documentation: 'System.out.println()', insertText: 'System.out.println(${1});' },
  { label: 'main', documentation: 'Main method template', insertText: 'public static void main(String[] args) {\n\t$0\n}' },
  { label: 'fori', documentation: 'Basic for loop', insertText: 'for (int i = 0; i < ${1:n}; i++) {\n\t$0\n}' },
  { label: 'foreach', documentation: 'Enhanced for-each loop', insertText: 'for (${1:int} ${2:item} : ${3:array}) {\n\t$0\n}' },
  { label: 'if', documentation: 'If statement', insertText: 'if (${1:condition}) {\n\t$0\n}' },
  { label: 'ifelse', documentation: 'If-Else statement', insertText: 'if (${1:condition}) {\n\t$0\n} else {\n\t$2\n}' },
  { label: 'while', documentation: 'While loop', insertText: 'while (${1:condition}) {\n\t$0\n}' },
  { label: 'dowhile', documentation: 'Do-While loop', insertText: 'do {\n\t$0\n} while (${1:condition});' },
  { label: 'switch', documentation: 'Switch statement', insertText: 'switch (${1:var}) {\n\tcase ${2:value}:\n\t\t$0\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}' },
  { label: 'trycatch', documentation: 'Try-Catch block', insertText: 'try {\n\t$0\n} catch (${1:Exception} e) {\n\t${2:e.printStackTrace();}\n}' },
  { label: 'class', documentation: 'Class definition', insertText: 'public class ${1:ClassName} {\n\t$0\n}' },
  { label: 'method', documentation: 'Method definition', insertText: 'public ${1:void} ${2:methodName}(${3:args}) {\n\t$0\n}' },
  { label: 'binarySearch', documentation: 'Binary search template', insertText: 'int left = 0;\nint right = ${1:arr}.length - 1;\nwhile (left <= right) {\n\tint mid = left + (right - left) / 2;\n\tif (${1:arr}[mid] == ${2:target}) return mid;\n\tif (${1:arr}[mid] < ${2:target}) left = mid + 1;\n\telse right = mid - 1;\n}\nreturn -1;' },
  { label: 'traverse', documentation: 'Standard array traversal', insertText: 'for (int i = 0; i < ${1:arr}.length; i++) {\n\t$0\n}' },
];

const LIBRARY_SUGGESTIONS: Record<string, string[]> = {
  'System': ['out', 'err', 'in', 'currentTimeMillis()', 'exit()', 'getProperty()'],
  'System.out': ['println()', 'print()', 'printf()', 'format()', 'flush()'],
  'Math': ['sqrt(${1})', 'random()', 'max(${1}, ${2})', 'min(${1}, ${2})', 'pow(${1}, ${2})', 'abs(${1})', 'PI', 'E'],
  'Scanner': ['nextInt()', 'next()', 'nextLine()', 'nextDouble()', 'hasNext()'],
};

const COMMON_CLASSES = ['ArrayList', 'HashMap', 'Scanner', 'String', 'Integer', 'Double', 'Math', 'System'];

/**
 * Extracts variable and method names from the current code.
 */
function getWorkspaceSymbols(model: monaco.editor.ITextModel) {
  const text = model.getValue();
  const vars = new Set<string>();
  const methods = new Set<string>();

  // Variable regex: type name = ...
  const varRegex = /\b(?:int|double|float|long|boolean|String|char|var|List|Map|ArrayList|HashMap)\b(?:\s*\[\])?\s+([A-Za-z_]\w*)\b/g;
  let match;
  while ((match = varRegex.exec(text)) !== null) {
    if (match[1] && !JAVA_KEYWORDS.includes(match[1])) vars.add(match[1]);
  }

  // Method regex: type name(...) {
  const methodRegex = /\b(?:public|private|protected|static|\s) +[\w<>\[\]]+\s+([A-Za-z_]\w*)\s*\(/g;
  while ((match = methodRegex.exec(text)) !== null) {
    if (match[1] && !JAVA_KEYWORDS.includes(match[1]) && !COMMON_CLASSES.includes(match[1])) {
      methods.add(match[1]);
    }
  }

  return { vars: Array.from(vars), methods: Array.from(methods) };
}

export function setupJavaIntelliSense() {
  monaco.languages.registerCompletionItemProvider('java', {
    triggerCharacters: ['.', ' ', '(', 'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
    provideCompletionItems: (model, position) => {
      const lineUntilCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      const suggestions: monaco.languages.CompletionItem[] = [];

      // 1. CONTEXT: Dot trigger (System., Math., etc.)
      if (lineUntilCursor.endsWith('.')) {
        const parts = lineUntilCursor.trim().split(/\s+/);
        const lastPart = parts[parts.length - 1];
        
        if (lastPart) {
          const expression = lastPart.substring(0, lastPart.length - 1);

          if (LIBRARY_SUGGESTIONS[expression]) {
            LIBRARY_SUGGESTIONS[expression].forEach(item => {
              suggestions.push({
                label: item.replace(/\(.*\)/, ''),
                kind: item.includes('(') ? monaco.languages.CompletionItemKind.Method : monaco.languages.CompletionItemKind.Property,
                insertText: item,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range
              });
            });
            return { suggestions };
          }
        }
      }

      // 2. CONTEXT: "new " trigger
      if (lineUntilCursor.endsWith('new ')) {
        COMMON_CLASSES.forEach(cls => {
          suggestions.push({
            label: cls,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: cls + '(${1});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          });
        });
        return { suggestions };
      }

      // 3. KEYWORDS
      JAVA_KEYWORDS.forEach(kw => {
        suggestions.push({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range
        });
      });

      // 4. SNIPPETS
      JAVA_SNIPPETS.forEach(snip => {
        suggestions.push({
          label: snip.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: snip.documentation,
          insertText: snip.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        });
      });

      // 5. WORKSPACE SYMBOLS (Vars & Methods)
      const symbols = getWorkspaceSymbols(model);
      symbols.vars.forEach(v => {
        suggestions.push({
          label: v,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: v,
          range
        });
      });
      symbols.methods.forEach(m => {
        suggestions.push({
          label: m,
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: m + '(${1})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        });
      });

      // 6. COMMON CLASSES
      COMMON_CLASSES.forEach(cls => {
        suggestions.push({
          label: cls,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: cls,
          range
        });
      });

      return { suggestions };
    }
  });
}
