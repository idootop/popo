import { UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';

import { FileStore } from '@/store';

export function FileDrop() {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null) setIsDragging(false);
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) FileStore.value.upload(files);
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    isDragging && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-500/10 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 rounded-[32px] bg-white/90 p-12 shadow-2xl dark:bg-slate-900/90">
          <div className="animate-bounce rounded-full bg-blue-500 p-5 text-white">
            <UploadCloud size={40} />
          </div>
          <p className="font-bold text-xl">释放以上传文件</p>
        </div>
      </div>
    )
  );
}
