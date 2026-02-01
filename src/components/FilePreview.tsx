import { X } from 'lucide-react';

import { useFileStore } from '@/store';

import { FileIcon } from './FileIcon';

export function FilePreview() {
  const { previewFile, setPreviewFile } = useFileStore();
  if (!previewFile) return null;

  return (
    <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
  );
}

const FilePreviewModal = ({ file, onClose }) => {
  const PREVIEW_MAP = {
    image: (
      <img
        alt="预览"
        className="max-h-[80vh] w-auto object-contain"
        src={file.url}
      />
    ),
    video: (
      <video
        className="max-h-[80vh] w-full"
        controls
        playsInline
        preload="metadata"
        src={file.url}
      />
    ),
    audio: (
      <audio
        className="w-80 rounded-lg bg-slate-100 p-2"
        controls
        playsInline
        preload="metadata"
        src={file.url}
      />
    ),
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div
        className="relative z-10 flex max-w-4xl flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <div className="overflow-hidden rounded-xl bg-black/20 shadow-2xl">
          {PREVIEW_MAP[file.type] || (
            <div className="flex min-w-[320px] flex-col items-center gap-6 bg-white p-8 text-center md:p-12">
              <FileIcon fileName={file.Key} size={80} />
              <div className="max-w-xs">
                <h3 className="truncate font-bold text-gray-800 text-lg">
                  {file.Key}
                </h3>
                <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-left text-gray-500 text-xs">
                  {file.text || '暂无详细文本内容'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
