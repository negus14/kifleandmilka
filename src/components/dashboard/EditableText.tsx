"use client";

import React, { useRef, useCallback } from "react";

interface EditableTextProps {
  value: string;
  fieldKey: string;
  onUpdate: (fieldKey: string, value: string) => void;
  as?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  multiline?: boolean;
}

export default function EditableText({
  value,
  fieldKey,
  onUpdate,
  className = "",
  style,
  children,
  multiline = false,
}: EditableTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const handleBlur = useCallback(() => {
    if (!ref.current) return;
    const newVal = ref.current.innerText.trim();
    if (newVal !== value) {
      onUpdate(fieldKey, newVal);
    }
  }, [fieldKey, value, onUpdate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        ref.current?.blur();
      }
      if (e.key === "Escape") {
        if (ref.current) ref.current.innerText = value;
        ref.current?.blur();
      }
    },
    [multiline, value]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-editable={fieldKey}
      className={className}
      style={style}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    >
      {children ?? value}
    </span>
  );
}
