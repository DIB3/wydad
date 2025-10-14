import api from './api';

const attachmentService = {
  // Upload d'un fichier
  async uploadFile(file, entityType, entityId, category = 'general', description = '', metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);
    formData.append('category', category);
    if (description) formData.append('description', description);
    if (metadata && Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await api.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Récupération par entité
  async getByEntity(entityType, entityId, category = null, includeDeleted = false) {
    const params = {};
    if (category) params.category = category;
    if (includeDeleted) params.include_deleted = 'true';

    const response = await api.get(`/attachments/entity/${entityType}/${entityId}`, { params });
    return response.data;
  },

  // Récupération par ID
  async getById(id) {
    const response = await api.get(`/attachments/${id}`);
    return response.data;
  },

  // URL de téléchargement
  getDownloadUrl(id) {
    return `${api.defaults.baseURL}/attachments/${id}/download`;
  },

  // URL d'affichage
  getViewUrl(id) {
    return `${api.defaults.baseURL}/attachments/${id}/view`;
  },

  // Téléchargement d'un fichier
  async downloadFile(id, filename) {
    const response = await api.get(`/attachments/${id}/download`, {
      responseType: 'blob'
    });

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'document');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Mise à jour métadonnées
  async updateMetadata(id, data) {
    const response = await api.put(`/attachments/${id}`, data);
    return response.data;
  },

  // Suppression logique
  async softDelete(id) {
    const response = await api.delete(`/attachments/${id}/soft`);
    return response.data;
  },

  // Suppression physique
  async hardDelete(id) {
    const response = await api.delete(`/attachments/${id}/hard`);
    return response.data;
  },

  // Restauration
  async restore(id) {
    const response = await api.post(`/attachments/${id}/restore`);
    return response.data;
  },

  // Statistiques
  async getStats(entityType = null, entityId = null) {
    const params = {};
    if (entityType) params.entity_type = entityType;
    if (entityId) params.entity_id = entityId;

    const response = await api.get('/attachments/stats', { params });
    return response.data;
  }
};

export default attachmentService;
