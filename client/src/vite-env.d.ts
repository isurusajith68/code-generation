/// <reference types="vite/client" />

// Type declarations for File System Access API
declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemDirectoryHandle {
    name: string;
    kind: "directory";
  }
}
