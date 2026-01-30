export type FileType =
  | 'audio'
  | 'video'
  | 'image'
  | 'vector'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'ppt'
  | 'archive'
  | 'code'
  | 'text'
  | 'disk'
  | 'font'
  | 'cert'
  | 'unknown';

const TYPE_RULES: Record<FileType, RegExp> = {
  audio: /\.(mp3|wav|ogg|flac|m4a|aac|opus)$/i,
  video: /\.(mp4|mov|avi|mkv|webm|flv|wmv)$/i,
  image: /\.(jpg|jpeg|png|gif|webp|bmp|ico|heic)$/i,
  vector: /\.(svg|ai|eps)$/i,
  pdf: /\.pdf$/i,
  word: /\.(doc|docx|dot|rtf)$/i,
  excel: /\.(xls|xlsx|csv|ods)$/i,
  ppt: /\.(ppt|pptx|key)$/i,
  archive: /\.(zip|rar|7z|tar|gz|pkg|dmg)$/i,
  code: /\.(js|ts|jsx|tsx|html|css|py|go|json|php|sh|c|cpp|rb|rs|java|yml|yaml)$/i,
  text: /\.(txt|md|log)$/i,
  disk: /\.(iso|vmdk|img)$/i,
  font: /\.(ttf|otf|woff|woff2)$/i,
  cert: /\.(pem|crt|cer|key|pub)$/i,
  unknown: /^$/,
};

export const getFileType = (fileName: string): FileType => {
  const match = Object.entries(TYPE_RULES).find(([_, regex]) =>
    regex.test(fileName),
  );
  return (match ? match[0] : 'unknown') as FileType;
};

export const getFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / k ** i).toFixed(1)) + ' ' + sizes[i];
};
