import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'matlab' | 'verilog';
  height?: string;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  height = '480px',
  readOnly = false,
}) => {
  const isDark = document.documentElement.classList.contains('dark');

  // Map to Monaco supported language identifiers
  const monacoLang = language === 'matlab' ? 'matlab' : 'verilog';

  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      height: height,
      backgroundColor: 'var(--bg-card)'
    }}>
      <Editor
        height="100%"
        language={monacoLang}
        theme={isDark ? 'vs-dark' : 'light'}
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', Cascadia Code, Consolas, monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          bracketPairColorization: { enabled: true },
        }}
        loading={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            fontSize: '13px'
          }}>
            Loading Code Editor...
          </div>
        }
      />
    </div>
  );
};
