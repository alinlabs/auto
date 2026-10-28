import { create } from 'zustand';

interface CodeAnimationState {
  isWriting: boolean;
  currentLines: number;
  currentBytes: number;
  targetLines: number;
  targetBytes: number;
  startWriting: (targetLines?: number, targetBytes?: number) => void;
  updateProgress: (currentLines: number, currentBytes: number) => void;
  finishWriting: () => void;
}

export const useCodeAnimationStore = create<CodeAnimationState>((set) => ({
  isWriting: false,
  currentLines: 0,
  currentBytes: 0,
  targetLines: 0,
  targetBytes: 0,
  startWriting: (targetLines = 0, targetBytes = 0) =>
    set({
      isWriting: true,
      currentLines: 0,
      currentBytes: 0,
      targetLines,
      targetBytes,
    }),
  updateProgress: (currentLines: number, currentBytes: number) =>
    set({
      currentLines,
      currentBytes,
    }),
  finishWriting: () =>
    set((state) => ({
      isWriting: false,
      currentLines: state.targetLines,
      currentBytes: state.targetBytes,
    })),
}));
