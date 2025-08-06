import { useEffect, useRef, useState } from 'react';
import { Button } from './button';

interface WhiteboardProps {
    width?: number;
    height?: number;
    onSave?: (dataUrl: string) => void;
}

export function Whiteboard({ width = 800, height = 600, onSave }: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(2);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = color;
                ctx.lineWidth = brushSize;
                ctx.lineCap = 'round';
                setContext(ctx);
            }
        }
    }, [color, brushSize]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (context) {
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                context.beginPath();
                context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                setIsDrawing(true);
            }
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDrawing && context) {
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                context.stroke();
            }
        }
    };

    const stopDrawing = () => {
        if (context) {
            context.closePath();
            setIsDrawing(false);
        }
    };

    const clearCanvas = () => {
        if (context && canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const saveCanvas = () => {
        if (canvasRef.current && onSave) {
            const dataUrl = canvasRef.current.toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4 mb-4">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10"
                />
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-32"
                />
                <Button onClick={clearCanvas} variant="outline">
                    Clear
                </Button>
                <Button onClick={saveCanvas}>Save</Button>
            </div>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border border-gray-300 rounded-lg shadow-sm"
            />
        </div>
    );
}
