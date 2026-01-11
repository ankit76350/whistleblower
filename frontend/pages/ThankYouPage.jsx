import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SecretKeyBadge from '../components/SecretKeyBadge';
import { CheckCircle } from 'lucide-react';

const ThankYouPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const secretKey = searchParams.get('secret_key');

  if (!secretKey) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600">{t('thankYou.errorTitle')}</h2>
        <Link to="/" className="text-blue-600 underline mt-4 block">{t('thankYou.returnHome')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{t('thankYou.title')}</h1>
        <p className="text-slate-600 mt-2">
          {t('thankYou.subtitle')}
        </p>
      </div>

      <SecretKeyBadge secretKey={secretKey} />

      <div className="mt-8 text-center">
        <Link
          to="/check"
          className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
        >
          {t('thankYou.checkStatusLink')}
        </Link>
      </div>
    </div>
  );
};

export default ThankYouPage;
