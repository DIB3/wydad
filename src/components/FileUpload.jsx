import { useState } from 'react';
import { Upload, X, File, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import attachmentService from '@/services/attachment.service';

export function FileUpload({ entityType, entityId, category = 'general', onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [description, setDescription] = useState('');

  // Catégories selon le type d'entité
  const categories = {
    visit_pcma: [
      { value: 'pcma_general', label: '📋 PCMA Général' },
      { value: 'anthropometry', label: '📏 Anthropométrie' },
      { value: 'vital_signs', label: '💓 Signes vitaux' },
      { value: 'ecg', label: '📊 ECG' },
      { value: 'echocardiography', label: '❤️ Échocardiographie' },
      { value: 'respiratory_function', label: '🫁 Fonction respiratoire' },
      { value: 'blood_test', label: '🩸 Analyse sanguine' },
      { value: 'urine_test', label: '💧 Analyse urinaire' },
      { value: 'radiology', label: '📷 Radiologie' },
      { value: 'mri', label: '🧲 IRM' },
      { value: 'ct_scan', label: '🔬 Scanner' },
      { value: 'ultrasound', label: '🔊 Échographie' },
      { value: 'musculoskeletal_exam', label: '🦴 Examen musculo-squelettique' },
      { value: 'fitness_decision', label: '✅ Décision d\'aptitude' },
      { value: 'general', label: '📄 Général' }
    ],
    visit_injury: [
      { value: 'injury_photo', label: '📸 Photo de la blessure' },
      { value: 'injury_xray', label: '🦴 Radiographie' },
      { value: 'injury_mri', label: '🧲 IRM' },
      { value: 'injury_report', label: '📋 Rapport médical' },
      { value: 'treatment_plan', label: '💊 Plan de traitement' }
    ],
    visit_nutrition: [
      { value: 'meal_plan', label: '🍽️ Plan de repas' },
      { value: 'nutrition_analysis', label: '📊 Analyse nutritionnelle' },
      { value: 'body_composition', label: '⚖️ Composition corporelle' }
    ],
    visit_gps: [
      { value: 'gps_report', label: '📍 Rapport GPS' },
      { value: 'performance_analysis', label: '📈 Analyse de performance' },
      { value: 'training_data', label: '🏃 Données d\'entraînement' }
    ],
    visit_impedance: [
      { value: 'impedance_report', label: '📊 Rapport d\'impédance' },
      { value: 'body_scan', label: '🔍 Scan corporel' }
    ],
    player: [
      { value: 'identification', label: '🪪 Pièce d\'identité' },
      { value: 'administrative', label: '📄 Document administratif' },
      { value: 'certificate', label: '📜 Certificat' },
      { value: 'general', label: '📁 Autre' }
    ]
  };

  const availableCategories = categories[entityType] || [{ value: 'general', label: '📄 Général' }];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Vérification de la taille (10 MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 10 MB)');
        return;
      }

      // Vérification du type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Type de fichier non supporté. Formats acceptés: images, PDF, Word, Excel, texte.');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Aucun fichier sélectionné');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await attachmentService.uploadFile(
        file,
        entityType,
        entityId,
        selectedCategory,
        description
      );

      console.log('✅ Fichier uploadé:', result);

      // Reset
      setFile(null);
      setDescription('');
      
      // Callback
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      console.error('❌ Erreur upload:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <Card className="border-2 border-dashed border-[#29BACD]/30 hover:border-[#29BACD] transition-colors">
      <CardContent className="p-6">
        {!file ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-[#29BACD]/10 to-[#7BD5E1]/10">
              <Upload className="h-12 w-12 text-[#29BACD]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Glissez-déposez un fichier ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Images, PDF, Word, Excel (max 10 MB)
              </p>
            </div>
            <Input
              type="file"
              onChange={handleFileChange}
              className="max-w-xs cursor-pointer"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Fichier sélectionné */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#29BACD]/10 to-[#7BD5E1]/10 rounded-lg border border-[#29BACD]/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white">
                  <File className="h-6 w-6 text-[#29BACD]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={uploading}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Catégorie */}
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Ajouter une description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bouton upload */}
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-gradient-to-r from-[#29BACD] to-[#1A8A9A] hover:from-[#7BD5E1] hover:to-[#29BACD] text-white shadow-lg hover:shadow-xl transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Uploader le fichier
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

