
export const ReportStatus = {
  New: 'New',
  Received: 'Received',
  InProgress: 'InProgress',
  Closed: 'Closed',
  Canceled: 'Canceled',
};

const STORAGE_KEY = 'whistleblower_db_v1';
const TENANTS_STORAGE_KEY = 'whistleblower_tenants_v1';

// Initialize storage if empty
if (!localStorage.getItem(STORAGE_KEY)) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
if (!localStorage.getItem(TENANTS_STORAGE_KEY)) {
  localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify([
    {
      _id: "694a29bceaca6f2dc610196a",
      tenantId: "5a1155c8-3058-4f73-ba5c-48c4e782c434",
      email: "ankit@dsv.au.com",
      companyName: "DSV Corp3",
      active: true,
      createdAt: "2025-12-23T05:33:48.918+00:00"
    }
  ]));
}

const getDB = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveDB = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const getTenantsDB = () => {
  const data = localStorage.getItem(TENANTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveTenantsDB = (data) => {
  localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(data));
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
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

  // Use LookupResponse type here for clarity and consistency with api.ts
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

  // Tenant Operations
  getTenants: async () => {
    await new Promise((r) => setTimeout(r, 500));
    return getTenantsDB();
  },

  createTenant: async (email, companyName) => {
    await new Promise((r) => setTimeout(r, 700));
    const tenants = getTenantsDB();
    const newTenant = {
      _id: Math.random().toString(16).substr(2, 24),
      tenantId: generateUUID(),
      email,
      companyName,
      active: true,
      createdAt: new Date().toISOString()
    };
    tenants.push(newTenant);
    saveTenantsDB(tenants);
    return newTenant;
  },

  updateTenant: async (id, data) => {
    await new Promise((r) => setTimeout(r, 400));
    const tenants = getTenantsDB();
    const index = tenants.findIndex(t => t._id === id);
    if (index === -1) throw new Error('Tenant not found');

    tenants[index] = { ...tenants[index], ...data };
    saveTenantsDB(tenants);
    return tenants[index];
  },

  deleteTenant: async (id) => {
    await new Promise((r) => setTimeout(r, 400));
    const tenants = getTenantsDB();
    const filtered = tenants.filter(t => t._id !== id);
    saveTenantsDB(filtered);
  }
};
