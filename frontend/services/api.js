import { MockBackend } from './mockBackend';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Helper to convert File object to Base64 for mock storage
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Token storage for API calls
let currentAccessToken = null;

/**
 * Set the access token for API calls
 * Call this from components after auth state changes
 */
export const setAuthToken = (token) => {
  currentAccessToken = token;
};

/**
 * Get the current access token
 */
export const getAuthToken = () => currentAccessToken;

// Helper to get auth headers for protected API calls
const getAuthHeaders = () => {
  if (currentAccessToken) {
    return {
      'Authorization': `Bearer ${currentAccessToken}`,
    };
  }
  return {};
};



export const api = {
  createReport: async (tenantId, subject, message, files) => {
    console.log("createReport called with files:", files);
    try {
      const formData = new FormData();

      const reportData = {
        tenantId,
        subject,
        message,
        attachments: [] // Attachments list in JSON can be empty or used for other metadata
      };

      // Append reportData as JSON blob
      formData.append('reportData', new Blob([JSON.stringify(reportData)], { type: 'application/json' }));

      // Append attachments if any
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/whistleblower/anonymous/submitNewReport`, {
        method: 'POST',
        // Content-Type header matches boundary automatically when using FormData
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },

  lookupReport: async (secretKey) => {
    try {
      const response = await fetch(`${API_BASE_URL}/whistleblower/report/${secretKey}/conversation`);
      if (!response.ok) {
        throw new Error('Report not found');
      }
      const data = await response.json();
      // Returns: { report: {...}, messages: [...] }
      return data.report; // Return just the report for lookup purposes
    } catch (error) {
      console.error('Error looking up report:', error);
      throw error;
    }
  },

  // Get report by secretKey (for reporters/users)
  getReportBySecretKey: async (secretKey) => {
    try {
      const response = await fetch(`${API_BASE_URL}/whistleblower/report/${secretKey}/conversation`);
      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }
      const data = await response.json();
      // Returns: { report: {...}, messages: [...] }
      return data;
    } catch (error) {
      console.error('Error fetching report by secret key:', error);
      throw error;
    }
  },

  getReport: async (tenantId, reportId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/whistleblower/tenant/${tenantId}/report/${reportId}/conversation`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
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

  getFileUrl: async (key) => {
    try {
      const response = await fetch(`${API_BASE_URL}/whistleblower/file-url/${key}`);
      if (!response.ok) {
        throw new Error('Failed to get file URL');
      }
      const url = await response.text();
      return url;
    } catch (error) {
      console.error('Error fetching file URL:', error);
      throw error;
    }
  },

  updateReportStatus: async (reportId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/whistleblower/reports/${reportId}/status?status=${status}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      return response.json();
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  replyToReport: async (reportId, message, sender = 'COMPLIANCE_TEAM', files) => {
    try {
      // Process attachments if any
      // const attachmentData = ... (Removed as we now use FormData)

      const formData = new FormData();

      const messageData = {
        sender,
        message,
        attachments: []
      };

      formData.append('messageData', new Blob([JSON.stringify(messageData)], { type: 'application/json' }));

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/whistleblower/reports/${reportId}/messages`, {
        method: 'POST',
        // Content-Type matches boundary
        body: formData,
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
  getReports: async (tenantId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/whistleblower/tenant/${tenantId}/reports`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
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



  // Tenant Management
  getTenants: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/whistleblower/admin/getAllTenants`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
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

  createTenant: async (email, companyName, role = "ADMIN") => {
    try {
      // Step 1: Create tenant in MongoDB
      const response = await fetch(`${API_BASE_URL}/whistleblower/admin/addNewTenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ email, companyName, role }),
      });
      if (!response.ok) {
        throw new Error('Failed to create tenant');
      }
      const tenantData = await response.json();

      // Step 2: Invite user to Cognito with ADMIN role
      const cognitoResponse = await fetch(`${API_BASE_URL}/admin/invite/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          email,
          role: role  // Hardcoded role
        }),
      });

      if (!cognitoResponse.ok) {
        console.warn('Tenant created but Cognito invite failed');
        // Don't throw - tenant was created successfully, just log the warning
      }

      return tenantData.data; // Backend returns ApiResponse wrapper with data field
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/me`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }
      const data = await response.json();
      return data.data; // Backend returns ApiResponse wrapper with data field
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  updateTenant: async (tenantId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/whistleblower/admin/updateTenant/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
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
      const response = await fetch(`${API_BASE_URL}/whistleblower/deleteTenant/${tenantId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
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