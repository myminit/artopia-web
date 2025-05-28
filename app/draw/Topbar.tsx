'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

type Props = {
  drawingName: string;
  setDrawingName: (n: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport: (type: 'png'|'jpeg') => void;
  disabledSave: boolean;
};

export default function Topbar({
  drawingName,
  setDrawingName,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onExport,
  disabledSave,
}: Props) {
  const [showExport, setShowExport] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const baseButtonClass = "px-3 py-1 rounded transition duration-200 ease-in-out";
  const hoverable = "hover:opacity-80";

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
      <Link className="flex items-center space-x-2" href="/">
        <Image src="/img/logo.png" alt="Artopia Logo" width={40} height={40} />
        <h1 className="text-sky-500 text-3xl px-4 font-bold">Artopia</h1>
      </Link>
        <button onClick={onUndo} className={`${baseButtonClass} bg-gray-200 hover:bg-sky-500 ${hoverable}`}>Undo</button>
        <button onClick={onRedo} className={`${baseButtonClass} bg-gray-200 hover:bg-sky-500 ${hoverable}`}>Redo</button>
        <button onClick={onClear} className={`${baseButtonClass} bg-gray-200 hover:bg-sky-500 ${hoverable}`}>Clear</button>
      </div>
      
      <input
        type="text"
        className="border px-3 py-1 rounded w-64 text-center focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
        placeholder="Untitled"
        value={drawingName}
        onChange={e => setDrawingName(e.target.value)}
      />
      <div className="flex items-center space-x-2">
        <div ref={wrapRef} className="relative inline-block">
          <button
            onClick={() => setShowExport(v => !v)}
            className={`${baseButtonClass} bg-green-500 text-white ${hoverable}`}
          >
            Export
          </button>
          {showExport && (
            <div className="absolute top-full left-0 bg-white border shadow rounded mt-1 overflow-hidden">
              <button onClick={() => onExport('png')} className="w-full px-4 py-2 text-left hover:bg-gray-100">PNG</button>
              <button onClick={() => onExport('jpeg')} className="w-full px-4 py-2 text-left hover:bg-gray-100">JPG</button>
            </div>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={disabledSave}
          className={`${baseButtonClass} ${
            disabledSave
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : `bg-blue-500 text-white ${hoverable}`
          }`}
        >
          Save to Gallery
        </button>
      </div>
    </header>
  );
}
