import api from './api'

const certificateService = {
  async getAll() {
    const response = await api.get('/certificates')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/certificates/${id}`)
    return response.data
  },

  async getByPlayerId(playerId) {
    const response = await api.get(`/certificates/player/${playerId}`)
    return response.data
  },

  async create(certificateData) {
    const response = await api.post('/certificates', certificateData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/certificates/${id}`)
    return response.data
  },

  async download(id) {
    const response = await api.get(`/certificates/${id}/download`, {
      responseType: 'blob',
    })
    
    // Créer un lien de téléchargement et le déclencher
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Extraire le nom du fichier des headers ou utiliser un nom par défaut
    const contentDisposition = response.headers['content-disposition']
    let fileName = 'certificat_medical.pdf'
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1]
      }
    }
    
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return response.data
  },
}

export default certificateService

