import React, { useState } from 'react';
import { Copy, Check, Download, AlertOctagon } from 'lucide-react';

const SecretKeyBadge = ({ secretKey }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([`Whistleblower Box - Secret Key\n\nKEY: ${secretKey}\n\nKeep this safe. It is the ONLY way to access your report.`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `secret_key_${secretKey.substring(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <AlertOctagon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-bold text-amber-900">Save this Secret Key securely</h3>
          <p className="text-sm text-amber-800 mt-1">
            We do not store your email or IP. This key is the <strong>only way</strong> to check for replies or updates.
            If you lose it, access to this report is lost forever.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="flex-grow relative group">
          <code className="block w-full p-4 bg-white border-2 border-amber-200 border-dashed rounded-lg text-center font-mono text-lg font-bold text-slate-700 break-all select-all">
            {secretKey}
          </code>
        </div>
      </div>

      <div className="flex gap-3 mt-4 justify-center">
        <button
          onClick={handleCopy}
          className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all"
        >
          {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied' : 'Copy Key'}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-900 transition-all"
        >
          <Download className="w-4 h-4 mr-2" />
          Download .txt
        </button>
      </div>
    </div>
  );
};

export default SecretKeyBadge;
