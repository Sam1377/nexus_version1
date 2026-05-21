import React, { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { rust } from '@codemirror/lang-rust';
import './CodeEditor.css';

const LANG_MAP = {
  javascript: javascript({ jsx: true }),
  python: python(),
  java: java(),
  cpp: cpp(),
  html: html(),
  rust: rust(),
};

export default function CodeEditor({ code, language, onChange }) {
  const extensions = [LANG_MAP[language] || javascript({ jsx: true })];

  const handleChange = useCallback((value) => {
    onChange(value);
  }, [onChange]);

  return (
    <div className="code-editor-wrap">
      <CodeMirror
        value={code}
        height="100%"
        theme={vscodeDark}
        extensions={extensions}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
        }}
        style={{ height: '100%', fontSize: '14px' }}
      />
    </div>
  );
}
