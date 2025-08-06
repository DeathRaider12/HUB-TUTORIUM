import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from './button';
import { Select } from './select';

// Dynamic import of Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
    initialValue?: string;
    language?: string;
    onChange?: (value: string) => void;
    onRun?: (code: string) => void;
    height?: string;
}

const SUPPORTED_LANGUAGES = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'csharp',
    'go',
    'rust',
    'html',
    'css',
];

export function CodeEditor({
    initialValue = '',
    language = 'javascript',
    onChange,
    onRun,
    height = '400px',
}: CodeEditorProps) {
    const [code, setCode] = useState(initialValue);
    const [selectedLanguage, setSelectedLanguage] = useState(language);

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
            onChange?.(value);
        }
    };

    const handleRun = () => {
        onRun?.(code);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <Select
                    value={selectedLanguage}
                    onValueChange={(value) => setSelectedLanguage(value)}
                >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <Select.Option key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </Select.Option>
                    ))}
                </Select>
                {onRun && (
                    <Button onClick={handleRun} className="ml-4">
                        Run Code
                    </Button>
                )}
            </div>
            <div className="border rounded-lg overflow-hidden">
                <MonacoEditor
                    height={height}
                    language={selectedLanguage}
                    value={code}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
}
