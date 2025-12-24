import { MockBackend } from './mockBackend';

// Helper to convert File object to Base64 for mock storage
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const api = {
  createReport: async (subject, message, files) => {
    // Process attachments for mock backend (convert to base64)
    const attachmentData = await Promise.all(
      files.map(async (f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        dataUrl: await fileToBase64(f),
      }))
    );
    return MockBackend.createReport(subject, message, attachmentData);
  },

  lookupReport: async (secretKey) => {
    return MockBackend.lookupReport(secretKey);
  },

  getReport: async (reportId) => {
    const report = await MockBackend.getReportThread(reportId);
    if (!report) throw new Error('Report not found');
    return report;
  },

  replyToReport: async (reportId, text, from, files) => {
    const attachmentData = await Promise.all(
      files.map(async (f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        dataUrl: await fileToBase64(f),
      }))
    );
    return MockBackend.postReply(reportId, text, from, attachmentData);
  },

  // Admin specific
  getReports: async () => {
    return MockBackend.getAdminReports();
  },

  updateReportStatus: async (reportId, status) => {
    return MockBackend.updateStatus(reportId, status);
  },

  // Tenant Management
  getTenants: async () => {
    return MockBackend.getTenants();
  },

  createTenant: async (email, companyName) => {
    return MockBackend.createTenant(email, companyName);
  },

  updateTenant: async (id, data) => {
    return MockBackend.updateTenant(id, data);
  },

  deleteTenant: async (id) => {
    return MockBackend.deleteTenant(id);
  }
};