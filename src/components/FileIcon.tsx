import {
  AudioLines,
  Disc,
  FileArchive,
  FileCode,
  File as FileIconDefault,
  FileSpreadsheet,
  FileText,
  FileType2,
  Image as ImageIcon,
  Presentation,
  ShieldCheck,
  Type,
  Video,
} from 'lucide-react';

import { type FileType, getFileType } from '@/file';

const ICON_CONFIG: Record<FileType, { icon: any; color: string }> = {
  audio: { icon: AudioLines, color: 'text-pink-500' },
  video: { icon: Video, color: 'text-purple-500' },
  image: { icon: ImageIcon, color: 'text-blue-500' },
  pdf: { icon: FileType2, color: 'text-red-500' },
  word: { icon: FileText, color: 'text-blue-600' },
  excel: { icon: FileSpreadsheet, color: 'text-green-600' },
  ppt: { icon: Presentation, color: 'text-orange-500' }, // PPT/演示文稿
  archive: { icon: FileArchive, color: 'text-amber-600' },
  code: { icon: FileCode, color: 'text-indigo-500' },
  text: { icon: FileText, color: 'text-slate-500' },
  disk: { icon: Disc, color: 'text-zinc-400' }, // 镜像文件
  font: { icon: Type, color: 'text-lime-600' }, // 字体文件
  cert: { icon: ShieldCheck, color: 'text-cyan-600' }, // 证书/密钥
  unknown: { icon: FileIconDefault, color: 'text-slate-400' },
};

interface FileIconProps {
  fileName: string;
  size?: number;
  className?: string;
}

export const FileIcon = ({
  fileName,
  size = 24,
  className = '',
}: FileIconProps) => {
  const type = getFileType(fileName);
  const { icon: Icon, color } = ICON_CONFIG[type];

  return (
    <Icon className={`${color} ${className} transition-colors`} size={size} />
  );
};
