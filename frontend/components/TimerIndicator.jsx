import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { ReportStatus } from '../services/mockBackend';

const TimerIndicator = ({ createdAt, status }) => {
  // If status is not New, the timer pressure is off (technically, though deadlines exist for resolving, the 7-day is for acknowledgment)
  const isAcknowledged = status !== ReportStatus.New;

  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysLeft = 7 - diffDays;

  if (isAcknowledged) {
    return (
      <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
        <Clock className="w-3 h-3 mr-1" />
        Acknowledged
      </span>
    );
  }

  if (diffDays > 7) {
    return (
      <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded animate-pulse">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Overdue ({diffDays}d)
      </span>
    );
  }

  const isUrgent = daysLeft <= 2;

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded ${isUrgent ? 'text-amber-700 bg-amber-50' : 'text-slate-500 bg-slate-100'}`}>
      <Clock className="w-3 h-3 mr-1" />
      {diffDays === 0 ? 'Today' : `${diffDays}d ago`}
      <span className="mx-1">•</span>
      {daysLeft}d left
    </span>
  );
};

export default TimerIndicator;
