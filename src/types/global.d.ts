export {};

declare global {
  interface Window {
    frames: string[]; // массив кадров из frames.js
    fitTextToContainer: (
      text: string,
      fontFace: string,
      containerWidth: number
    ) => number;
  }
}
