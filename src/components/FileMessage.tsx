import { Download } from 'lucide-react';

import { FileIcon } from '@/components/FileIcon';
import type { COSFile } from '@/store';

import { handleFileAction } from './FileMenu';

interface FileProps {
  file: COSFile;
}

export const FileMessage: React.FC<FileProps> = (props) => {
  const { file } = props;

  const getRendererKey = () => {
    if (file.isMsg) return 'msg';
    return file.type;
  };

  const renderers: Record<string, React.FC<FileProps>> = {
    image: ImageContent,
    msg: MessageContent,
    audio: AudioContent,
    video: VideoContent,
    default: DefaultFileContent,
  };

  const ContentComponent = renderers[getRendererKey()] || DefaultFileContent;

  // 动态样式计算
  const containerClasses = file.isMsg
    ? 'rounded-[22px] rounded-tl-[4px] bg-white px-4 py-2.5 shadow-sm ring-1 ring-black/5 dark:bg-[#1C1C1E] dark:text-white dark:ring-white/10'
    : 'rounded-2xl bg-white/40 p-2 shadow-sm ring-1 ring-black/5 backdrop-blur-md dark:bg-white/5';

  return (
    <div
      className={`cursor-pointer transition-all duration-300 ${containerClasses}`}
      onClick={() => handleFileAction('preview', file)}
    >
      <ContentComponent {...props} />
    </div>
  );
};

// 文本/消息组件
const MessageContent: React.FC<FileProps> = ({ file }) => (
  <p className="whitespace-pre-wrap text-[15px] text-slate-800 leading-relaxed dark:text-slate-200">
    {file.text}
  </p>
);

// 图片组件
const ImageContent: React.FC<FileProps> = ({ file }) => (
  <div className="cursor-pointer overflow-hidden rounded-xl">
    <img
      alt={file.Key}
      className="max-h-72 w-auto object-cover md:max-h-[500px]"
      src={file.url}
    />
  </div>
);

const VideoContent: React.FC<{ file: any }> = ({ file }) => (
  <div className="group relative overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
    <video
      className="max-h-80 w-auto rounded-xl shadow-sm md:max-h-[500px]"
      controls
      preload="metadata"
    >
      <source src={file.url} type="video/mp4" />
      您的浏览器不支持视频播放。
    </video>
  </div>
);

const AudioContent: React.FC<{ file: any }> = ({ file }) => (
  <div className="flex items-center">
    <audio className="rounded-xl" controls preload="metadata" src={file.url} />
  </div>
);

// 通用文件组件
const DefaultFileContent: React.FC<FileProps> = ({ file }) => (
  <div className="flex min-w-[220px] items-center gap-3 px-1 py-1">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-blue-500 dark:bg-blue-500/10">
      <FileIcon fileName={file.Key} size={28} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="truncate font-semibold text-[14px] text-slate-800 dark:text-slate-100">
        {file.Key}
      </div>
      <div className="font-bold text-[11px] text-slate-400 uppercase tracking-tight">
        {file.size}
      </div>
    </div>
    <button
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-50"
      onClick={(e) => {
        e.stopPropagation();
        handleFileAction('download', file);
      }}
    >
      <Download size={18} />
    </button>
  </div>
);
