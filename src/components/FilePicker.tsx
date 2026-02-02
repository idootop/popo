import type React from 'react';
import { type ChangeEvent, type ReactNode, useRef } from 'react';

interface FileUploadProps {
  /** 允许的文件类型，例如 'image/*', '.pdf' */
  accept?: string;
  /** 是否允许选择多个文件 */
  multiple?: boolean;
  /** 文件选择后的回调 */
  onSelect: (files: File[]) => void;
  /** 自定义包裹组件 */
  children: ReactNode;
  /** 额外的容器样式 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

export const FilePicker: React.FC<FileUploadProps> = ({
  accept,
  multiple = true,
  onSelect,
  children,
  className = '',
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onSelect(Array.from(files));
      // 重置 value 确保同一个文件连续上传能触发 change
      e.target.value = '';
    }
  };

  return (
    <div className={`relative inline-block ${className}`} onClick={handleClick}>
      <input
        accept={accept}
        className="hidden"
        disabled={disabled}
        multiple={multiple}
        onChange={handleInputChange}
        ref={inputRef}
        type="file"
      />
      {children}
    </div>
  );
};
