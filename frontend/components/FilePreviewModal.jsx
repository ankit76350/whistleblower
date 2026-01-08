import React from 'react';
import { X, Download } from 'lucide-react';

const FilePreviewModal = ({ isOpen, onClose, fileUrl, fileName }) => {
    if (!isOpen) return null;

    const getFileType = (name) => {
        if (!name) return 'unknown';
        const ext = name.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        if (ext === 'pdf') return 'pdf';
        return 'other';
    };

    const fileType = getFileType(fileName);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-semibold text-slate-700 truncate">{fileName || 'File Preview'}</h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            download={fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Download"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-4">
                    {fileType === 'image' && (
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="max-w-full max-h-full object-contain shadow-lg rounded"
                        />
                    )}

                    {fileType === 'pdf' && (
                        <iframe
                            src={fileUrl}
                            className="w-full h-full min-h-[60vh] rounded shadow-sm bg-white"
                            title="PDF Preview"
                        />
                    )}

                    {fileType === 'other' && (
                        <div className="text-center p-10">
                            <div className="mb-4 text-slate-400">
                                <Download className="w-16 h-16 mx-auto mb-2" />
                            </div>
                            <p className="text-slate-600 mb-4">This file type cannot be previewed.</p>
                            <a
                                href={fileUrl}
                                download={fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg inline-flex items-center transition-colors"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
