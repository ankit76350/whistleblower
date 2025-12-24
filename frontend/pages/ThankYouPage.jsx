import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SecretKeyBadge from '../components/SecretKeyBadge';
import { CheckCircle } from 'lucide-react';

const ThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const secretKey = searchParams.get('secret_key');

  if (!secretKey) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600">Error: No key found</h2>
        <Link to="/" className="text-blue-600 underline mt-4 block">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Report Submitted Successfully</h1>
        <p className="text-slate-600 mt-2">
          Your report has been securely received by the compliance team.
        </p>
      </div>

      <SecretKeyBadge secretKey={secretKey} />

      <div className="mt-8 text-center">
        <Link
          to="/check"
          className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
        >
          Go to Status Check &rarr;
        </Link>
      </div>
    </div>
  );
};

export default ThankYouPage;