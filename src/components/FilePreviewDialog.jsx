import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X, FileText, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export function FilePreviewDialog({ file, open, onOpenChange }) {
  const [error, setError] = useState(false)
  
  const getFileUrl = (fileId) => {
    return `http://localhost:8000/attachments/${fileId}/view`
  }

  const handleDownload = async () => {
    if (!file) return;
    try {
      const response = await fetch(`http://localhost:8000/attachments/${file.id}/download`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.original_filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur téléchargement:', err)
    }
  }

  const isImage = file?.mime_type?.startsWith('image/')
  const isPDF = file?.mime_type === 'application/pdf'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {!file ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-slate-500">Chargement...</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {file.original_filename}
              </DialogTitle>
              <DialogDescription>
                {file.description || 'Prévisualisation du fichier'}
              </DialogDescription>
            </DialogHeader>

        {/* Prévisualisation */}
        <div className="flex-1 overflow-auto bg-slate-50 rounded-lg p-4">
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <AlertCircle className="h-16 w-16 mb-4 text-slate-400" />
              <p>Impossible de charger le fichier</p>
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center">
              <img
                src={getFileUrl(file.id)}
                alt={file.original_filename}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                onError={() => setError(true)}
              />
            </div>
          ) : isPDF ? (
            <iframe
              src={getFileUrl(file.id)}
              className="w-full h-[60vh] border-0 rounded-lg shadow-lg"
              title={file.original_filename}
              onError={() => setError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <FileText className="h-16 w-16 mb-4 text-slate-400" />
              <p className="mb-4">Prévisualisation non disponible pour ce type de fichier</p>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Télécharger le fichier
              </Button>
            </div>
          )}
        </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-slate-500">
                {(file.size_bytes / 1024 / 1024).toFixed(2)} MB • {file.mime_type}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

