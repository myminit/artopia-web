'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TOOL_TYPE } from './constants';

type Props = {
  tool: TOOL_TYPE;
  setTool: (t: TOOL_TYPE) => void;
  brushSize: number;
  setBrushSize: (n: number) => void;
  primaryColor: string;
  secondaryColor: string;
  setPrimaryColor: (c: string) => void;
  setSecondaryColor: (c: string) => void;
  activeColor: 'primary' | 'secondary';
  setActiveColor: (v: 'primary' | 'secondary') => void;
};

const Toolbar: React.FC<Props> = ({
  tool,
  setTool,
  brushSize,
  setBrushSize,
  primaryColor,
  secondaryColor,
  setPrimaryColor,
  setSecondaryColor,
  activeColor,
  setActiveColor,
}) => {
  const [showPicker, setShowPicker]     = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'primary' | 'secondary'>('primary');
  const [pickerColor, setPickerColor]   = useState(primaryColor);
  const pickerRef = useRef<HTMLInputElement>(null);

  const tools: TOOL_TYPE[] = [
    TOOL_TYPE.BRUSH,
    TOOL_TYPE.ERASER,
    TOOL_TYPE.FILL,
    TOOL_TYPE.RECT,
    TOOL_TYPE.CIRCLE,
    TOOL_TYPE.TRIANGLE,
    TOOL_TYPE.LINE,
    TOOL_TYPE.MOVE,
  ];

  // 點擊外部關閉 color picker
  useEffect(() => {
    if (!showPicker) return;
    const fn = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [showPicker]);

  const onSwatchClick = (type: 'primary' | 'secondary') => {
    setActiveColor(type);
  };
  const onSwatchDouble = (type: 'primary' | 'secondary') => {
    setPickerTarget(type);
    setPickerColor(type === 'primary' ? primaryColor : secondaryColor);
    setShowPicker(true);
    setActiveColor(type);
  };
  const onColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = e.target.value;
    setPickerColor(c);
    if (pickerTarget === 'primary') setPrimaryColor(c);
    else setSecondaryColor(c);
  };

  return (
    <aside className="fixed top-20 left-4 flex flex-col space-y-4 bg-white shadow-lg p-3 rounded z-50">
      <div className="flex flex-col space-y-1">
        {tools.map((t) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={`p-2 rounded text-sm ${
              tool === t ? 'bg-sky-500  text-white' : 'bg-gray-100 hover:bg-sky-200'
            }`}
          >
            {t === TOOL_TYPE.RECT ? 'RECTANGLE' : t}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label
          htmlFor="brush-size"
          className="flex items-center space-x-2 text-gray-700 font-semibold mb-2 select-none"
        >
  
          <span>ขนาดแปรง</span>
        </label>
        <input
          id="brush-size"
          type="range"
          min={1}
          max={100}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer appearance-none
            accent-blue-500"
        />
        <div className="text-right text-sm text-gray-600 mt-1">{brushSize}px</div>
      </div>

      <div className="pt-2">
        <div className="text-xs font-semibold">
          สี (คลิก=เลือก, ดับเบิล=เปลี่ยน)
        </div>
        <div className="flex space-x-2">
          {(['primary', 'secondary'] as const).map((type) => (
            <div
              key={type}
              onClick={() => onSwatchClick(type)}
              onDoubleClick={() => onSwatchDouble(type)}
              className={`w-8 h-8 border-2 cursor-pointer ${
                activeColor === type ? 'border-black' : 'border-gray-300'
              }`}
              style={{
                backgroundColor:
                  type === 'primary' ? primaryColor : secondaryColor,
              }}
            />
          ))}
        </div>
        {showPicker && (
          <input
            ref={pickerRef}
            type="color"
            autoFocus
            value={pickerColor}
            onChange={onColorChange}
            onBlur={() => setShowPicker(false)}
            className="absolute z-50"
          />
        )}
      </div>
    </aside>
  );
};

export default Toolbar;
