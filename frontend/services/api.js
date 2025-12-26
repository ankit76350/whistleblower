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
  createReport: async (tenantId, subject, message, files) => {
    try {
      // Process attachments if any
      const attachmentData = files && files.length > 0
        ? await Promise.all(
          files.map(async (f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
            dataUrl: await fileToBase64(f),
          }))
        )
        : null;

      const response = await fetch('http://localhost:8080/whistleblower/anonymous/submitNewReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          subject,
          message,
          attachments: attachmentData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const data = await response.json();
      return data; // Returns: { id, reportId, secretKey, tenantId, subject, message, status, etc. }
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },

  lookupReport: async (secretKey) => {
    return MockBackend.lookupReport(secretKey);
  },

  getReport: async (reportId) => {
    try {
      const tenantId = '6ce19dbb-84d7-490a-95a1-d935545d4898';
      const response = await fetch(`http://localhost:8080/whistleblower/tenant/${tenantId}/report/${reportId}/conversation`);
      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }
      const data = await response.json();
      // Returns: { report: {...}, messages: [...] }
      return data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },

  replyToReport: async (reportId, message, sender = 'COMPLIANCE_TEAM', files) => {
    try {
      // Process attachments if any
      const attachmentData = files && files.length > 0
        ? await Promise.all(
          files.map(async (f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
            dataUrl: await fileToBase64(f),
          }))
        )
        : null;

      const response = await fetch(`http://localhost:8080/whistleblower/reports/${reportId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender,
          message,
          attachments: attachmentData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      const data = await response.json();
      return data; // Returns: { id, reportId, sender, message, attachments, readOrUnRead, createdAt }
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  },

  // Admin specific
  getReports: async () => {
    try {
      const response = await fetch('http://localhost:8080/whistleblower/tenant/6ce19dbb-84d7-490a-95a1-d935545d4898/reports');
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      return data; // Backend returns array directly
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  updateReportStatus: async (reportId, status) => {
    return MockBackend.updateStatus(reportId, status);
  },

  // Tenant Management
  getTenants: async () => {
    try {
      const response = await fetch('http://localhost:8080/whistleblower/admin/getAllTenants');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.data; // Backend returns ApiResponse wrapper with data field
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  createTenant: async (email, companyName) => {
    try {
      const response = await fetch('http://localhost:8080/whistleblower/admin/addNewTenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, companyName }),
      });
      if (!response.ok) {
        throw new Error('Failed to create tenant');
      }
      const data = await response.json();
      return data.data; // Backend returns ApiResponse wrapper with data field
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  },

  updateTenant: async (tenantId, data) => {
    try {
      const response = await fetch(`http://localhost:8080/whistleblower/admin/updateTenant/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update tenant');
      }
      const result = await response.json();
      return result.data; // Backend returns ApiResponse wrapper with data field
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  },

  deleteTenant: async (tenantId) => {
    try {
      const response = await fetch(`http://localhost:8080/whistleblower/deleteTenant/${tenantId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete tenant');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }
};