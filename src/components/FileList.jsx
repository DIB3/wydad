import { useState, useEffect } from 'react';
import { File, Download, Eye, Trash2, RotateCcw, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import attachmentService from '@/services/attachment.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function FileList({ entityType, entityId, category = null, onDelete, refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [entityType, entityId, category, refreshTrigger]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await attachmentService.getByEntity(entityType, entityId, category);
      setFiles(data);
    } catch (err) {
      console.error('❌ Erreur chargement fichiers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      await attachmentService.downloadFile(file.id, file.original_filename);
    } catch (err) {
      console.error('❌ Erreur téléchargement:', err);
    }
  };

  const handleView = (file) => {
    const viewUrl = attachmentService.getViewUrl(file.id);
    window.open(viewUrl, '_blank');
  };

  const handleDelete = async (file) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        await attachmentService.softDelete(file.id);
        await loadFiles();
        if (onDelete) onDelete(file);
      } catch (err) {
        console.error('❌ Erreur suppression:', err);
      }
    }
  };

  const handleRestore = async (file) => {
    try {
      await attachmentService.restore(file.id);
      await loadFiles();
    } catch (err) {
      console.error('❌ Erreur restauration:', err);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-[#29BACD]" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      // PCMA
      pcma_general: '📋 PCMA Général',
      anthropometry: '📏 Anthropométrie',
      vital_signs: '💓 Signes vitaux',
      ecg: '📊 ECG',
      echocardiography: '❤️ Échocardiographie',
      respiratory_function: '🫁 Fonction respiratoire',
      blood_test: '🩸 Analyse sanguine',
      urine_test: '💧 Analyse urinaire',
      radiology: '📷 Radiologie',
      mri: '🧲 IRM',
      ct_scan: '🔬 Scanner',
      ultrasound: '🔊 Échographie',
      musculoskeletal_exam: '🦴 Examen musculo-squelettique',
      fitness_decision: '✅ Décision d\'aptitude',
      injury_photo: '📸 Photo blessure',
      injury_xray: '🦴 Radiographie',
      injury_mri: '🧲 IRM blessure',
      injury_report: '📋 Rapport médical',
      treatment_plan: '💊 Plan de traitement',
      meal_plan: '🍽️ Plan de repas',
      nutrition_analysis: '📊 Analyse nutritionnelle',
      body_composition: '⚖️ Composition corporelle',
      gps_report: '📍 Rapport GPS',
      performance_analysis: '📈 Analyse performance',
      training_data: '🏃 Données entraînement',
      impedance_report: '📊 Rapport impédance',
      body_scan: '🔍 Scan corporel',
      identification: '🪪 Pièce d\'identité',
      administrative: '📄 Document administratif',
      certificate: '📜 Certificat',
      general: '📄 Général',
      other: '📁 Autre'
    };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#29BACD] mx-auto mb-2" />
          <p className="text-sm text-gray-500">Chargement des fichiers...</p>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <File className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Aucun fichier attaché</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-[#29BACD]/5 to-[#7BD5E1]/5">
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5 text-[#29BACD]" />
          Fichiers attachés ({files.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                file.is_deleted 
                  ? 'bg-gray-50 opacity-60 border-gray-200' 
                  : 'bg-white hover:bg-gradient-to-r hover:from-[#29BACD]/5 hover:to-[#7BD5E1]/5 border-gray-200 hover:border-[#29BACD]/30 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getFileIcon(file.mime_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.original_filename}
                    </p>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {getCategoryLabel(file.category)}
                    </Badge>
                    {file.is_deleted && (
                      <Badge variant="destructive" className="text-xs shrink-0">
                        Supprimé
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-1 flex-wrap gap-1">
                    <p className="text-xs text-gray-500">
                      {(file.size_bytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(file.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </p>
                    {file.uploader && (
                      <p className="text-xs text-gray-500">
                        par {file.uploader.first_name} {file.uploader.last_name}
                      </p>
                    )}
                  </div>
                  {file.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{file.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                {!file.is_deleted ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(file)}
                      title="Voir"
                      className="hover:bg-[#29BACD]/10 hover:text-[#29BACD]"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      title="Télécharger"
                      className="hover:bg-[#29BACD]/10 hover:text-[#29BACD]"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      title="Supprimer"
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(file)}
                    title="Restaurer"
                    className="hover:bg-green-50 hover:text-green-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

