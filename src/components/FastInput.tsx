import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

export interface FastInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (val: string) => void;
  debounceMs?: number;
  transform?: (val: string) => string;
}

export const FastInput = memo(function FastInput({
  value: externalValue,
  onChange: onExternalChange,
  debounceMs = 150,
  transform,
  onBlur,
  onKeyDown,
  ...props
}: FastInputProps) {
  const [localValue, setLocalValue] = useState(externalValue ?? '');
  const timerRef = useRef<number | null>(null);
  const lastEmittedValueRef = useRef<string>(externalValue ?? '');

  // Sync external changes (e.g. from file switch, reset, or presets)
  useEffect(() => {
    if (externalValue !== lastEmittedValueRef.current) {
      setLocalValue(externalValue ?? '');
      lastEmittedValueRef.current = externalValue ?? '';
    }
  }, [externalValue]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let nextVal = e.target.value;
    if (transform) {
      nextVal = transform(nextVal);
    }
    setLocalValue(nextVal);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      lastEmittedValueRef.current = nextVal;
      onExternalChange(nextVal);
    }, debounceMs);
  }, [debounceMs, onExternalChange, transform]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (localValue !== lastEmittedValueRef.current) {
      lastEmittedValueRef.current = localValue;
      onExternalChange(localValue);
    }
    onBlur?.(e);
  }, [localValue, onExternalChange, onBlur]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (localValue !== lastEmittedValueRef.current) {
        lastEmittedValueRef.current = localValue;
        onExternalChange(localValue);
      }
    }
    onKeyDown?.(e);
  }, [localValue, onExternalChange, onKeyDown]);

  return (
    <input
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
});

export interface FastTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (val: string) => void;
  debounceMs?: number;
  transform?: (val: string) => string;
  autoResize?: boolean;
}

export const FastTextarea = memo(function FastTextarea({
  value: externalValue,
  onChange: onExternalChange,
  debounceMs = 150,
  transform,
  autoResize = true,
  onBlur,
  onKeyDown,
  ...props
}: FastTextareaProps) {
  const [localValue, setLocalValue] = useState(externalValue ?? '');
  const timerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastEmittedValueRef = useRef<string>(externalValue ?? '');

  const adjustHeight = useCallback(() => {
    if (!autoResize || !textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [autoResize]);

  useEffect(() => {
    if (externalValue !== lastEmittedValueRef.current) {
      setLocalValue(externalValue ?? '');
      lastEmittedValueRef.current = externalValue ?? '';
    }
  }, [externalValue]);

  useEffect(() => {
    adjustHeight();
  }, [localValue, adjustHeight]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let nextVal = e.target.value;
    if (transform) {
      nextVal = transform(nextVal);
    }
    setLocalValue(nextVal);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      lastEmittedValueRef.current = nextVal;
      onExternalChange(nextVal);
    }, debounceMs);
  }, [debounceMs, onExternalChange, transform]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (localValue !== lastEmittedValueRef.current) {
      lastEmittedValueRef.current = localValue;
      onExternalChange(localValue);
    }
    onBlur?.(e);
  }, [localValue, onExternalChange, onBlur]);

  return (
    <textarea
      ref={textareaRef}
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
    />
  );
});

export default FastInput;
