import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from './button';
import { Textarea } from './textarea';

// Dynamic import of KaTeX to avoid SSR issues
const KaTeX = dynamic(() => import('react-katex'), { ssr: false });

interface MathEditorProps {
    initialValue?: string;
    onChange?: (value: string) => void;
}

export function MathEditor({ initialValue = '', onChange }: MathEditorProps) {
    const [latex, setLatex] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (value: string) => {
        setLatex(value);
        setError(null);
        onChange?.(value);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">LaTeX Input</label>
                    <Textarea
                        value={latex}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="Enter LaTeX equation (e.g., \frac{1}{2})"
                        className="font-mono"
                        rows={5}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Preview</label>
                    <div className="p-4 border rounded-lg bg-white min-h-[120px]">
                        {error ? (
                            <p className="text-red-500 text-sm">{error}</p>
                        ) : (
                            <KaTeX math={latex} block errorColor="#EF4444" onError={(err) => setError(err.message)} />
                        )}
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => handleChange(latex + '\\frac{}{}')}
                >
                    Fraction
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleChange(latex + '\\sqrt{}')}
                >
                    Square Root
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleChange(latex + '\\sum_{i=1}^{n}')}
                >
                    Sum
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleChange(latex + '\\int_{a}^{b}')}
                >
                    Integral
                </Button>
            </div>
        </div>
    );
}
