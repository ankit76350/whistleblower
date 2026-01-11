import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReportStatus } from '../services/mockBackend';

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const styles = {
    [ReportStatus.New]: 'bg-blue-100 text-blue-700 border-blue-200',
    [ReportStatus.Received]: 'bg-purple-100 text-purple-700 border-purple-200',
    [ReportStatus.InProgress]: 'bg-amber-100 text-amber-700 border-amber-200',
    [ReportStatus.Closed]: 'bg-slate-100 text-slate-600 border-slate-200',
    [ReportStatus.Canceled]: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {t(`status.${status}`)}
    </span>
  );
};

export default StatusBadge;