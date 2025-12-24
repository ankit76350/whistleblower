const STORAGE_KEY = 'whistleblower_db_v1';

export const ReportStatus = {
  New: 'new',
  InProgress: 'in_progress',
  Resolved: 'resolved',
  Closed: 'closed'
};

// Initialize storage if empty
if (!localStorage.getItem(STORAGE_KEY)) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

const getDB = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveDB = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateSecretKey = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const MockBackend = {
  createReport: async (subject, messageText, attachments) => {
    await new Promise((r) => setTimeout(r, 800)); // Simulate net lag
    const db = getDB();
    const report_id = `rpt_${generateId()}`;
    const secret_key = generateSecretKey();
    const created_at = new Date().toISOString();

    const newReport = {
      report_id,
      secret_key,
      subject,
      created_at,
      status: ReportStatus.New,
      messages: [
        {
          id: generateId(),
          from: 'reporter',
          text: messageText,
          attachments,
          created_at,
        },
      ],
    };

    db.push(newReport);
    saveDB(db);

    return { report_id, secret_key, created_at };
  },

  lookupReport: async (secret_key) => {
    await new Promise((r) => setTimeout(r, 500));
    const db = getDB();
    const report = db.find((r) => r.secret_key === secret_key);
    if (report) {
      return { report_id: report.report_id, found: true };
    }
    throw new Error('Invalid Secret Key');
  },

  getReportThread: async (report_id) => {
    await new Promise((r) => setTimeout(r, 400));
    const db = getDB();
    const report = db.find((r) => r.report_id === report_id);
    // In a real app, we would validate the secret key or session token here.
    return report || null;
  },

  postReply: async (report_id, text, from, attachments = []) => {
    await new Promise((r) => setTimeout(r, 600));
    const db = getDB();
    const index = db.findIndex((r) => r.report_id === report_id);
    if (index === -1) throw new Error('Report not found');

    const newMessage = {
      id: generateId(),
      from,
      text,
      attachments,
      created_at: new Date().toISOString(),
    };

    db[index].messages.push(newMessage);

    // Auto-update status if admin replies to New report
    if (from === 'admin' && db[index].status === ReportStatus.New) {
      db[index].status = ReportStatus.InProgress;
    }

    saveDB(db);
    return newMessage;
  },

  updateStatus: async (report_id, status) => {
    await new Promise((r) => setTimeout(r, 300));
    const db = getDB();
    const index = db.findIndex((r) => r.report_id === report_id);
    if (index !== -1) {
      db[index].status = status;
      saveDB(db);
    }
  },

  getAdminReports: async () => {
    await new Promise((r) => setTimeout(r, 400));
    return getDB();
  },
};
