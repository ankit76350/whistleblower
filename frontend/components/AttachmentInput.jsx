import React from 'react';
import { Paperclip, X, FileText } from 'lucide-react';

const AttachmentInput = ({ files, onChange, maxFiles = 3 }) => {

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Basic validation
      const validFiles = newFiles.filter(f => f.size <= 10 * 1024 * 1024); // 10MB limit
      onChange([...files, ...validFiles].slice(0, maxFiles));
    }
    e.target.value = ''; // reset
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <label
          htmlFor="file-upload"
          className={`
            cursor-pointer inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${files.length >= maxFiles
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'}
          `}
        >
          <Paperclip className="w-4 h-4 mr-2" />
          Attach Files
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={files.length >= maxFiles}
            accept="*"
          />
        </label>
        <span className="text-xs text-slate-500">Max 10MB (Images, PDF, Video, Docs)</span>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, idx) => (
            <li key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-200">
              <div className="flex items-center overflow-hidden">
                <FileText className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-slate-700 truncate">{file.name}</span>
                <span className="ml-2 text-xs text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="ml-2 p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttachmentInput;