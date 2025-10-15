import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Download, Loader2 } from 'lucide-react'
import cafLogo from '../images/caf.jpg'
import pcmaService from '../services/pcma.service'
import { toast } from 'sonner'

export function PCMAReport({ visitId, playerId, playerData, onClose }) {
  const [pcmaData, setPcmaData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fonction utilitaire pour afficher les valeurs avec fallback
  const displayValue = (value, fallback = '____') => {
    if (value === null || value === undefined || value === '') {
      return fallback
    }
    return value
  }

  useEffect(() => {
    const fetchPCMAData = async () => {
      try {
        setLoading(true)
        const response = await pcmaService.getByVisitId(visitId)
        setPcmaData(response)
      } catch (error) {
        console.error('Erreur lors du chargement des données PCMA:', error)
        // Si le PCMA n'existe pas encore (404), créer un objet vide
        if (error.response?.status === 404) {
          setPcmaData({}) // Formulaire vide pour remplissage manuel
        } else {
          toast.error('Erreur lors du chargement du rapport')
        }
      } finally {
        setLoading(false)
      }
    }

    if (visitId) {
      fetchPCMAData()
    }
  }, [visitId])

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // La fonction d'impression du navigateur avec l'option "Enregistrer au format PDF"
    window.print()
    toast.info('Sélectionnez "Enregistrer au format PDF" dans la boîte de dialogue d\'impression')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (pcmaData === null) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Chargement des données...</p>
      </div>
    )
  }

  return (
    <>
      {/* Boutons d'action - cachés à l'impression */}
      <div className="no-print mb-4">
        {/* Message d'information si le formulaire est vide */}
        {Object.keys(pcmaData).length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              ℹ️ <strong>Information :</strong> Aucune donnée PCMA n'a encore été enregistrée pour cette visite. 
              Le rapport affichera un formulaire vide à remplir manuellement. 
              Veuillez d'abord enregistrer les données dans le formulaire PCMA pour générer un rapport complet.
            </p>
          </div>
        )}
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Rapport PCMA - Format CAF */}
      <div className="pcma-report bg-white">
        {/* Page 1 - Couverture */}
        <div className="report-page">
          <div className="flex flex-col items-center justify-center min-h-[800px] p-8">
            {/* Logo CAF (image officielle) */}
            <div className="mb-12 flex justify-center">
              <img src={cafLogo} alt="CAF" className="w-48 h-48 object-contain print:opacity-100" />
            </div>

            {/* Titre */}
            <h1 className="text-3xl font-bold text-center mb-16">
              EXAMEN MEDICAL D'AVANT-COMPETITION +<br/>
              (PCMA +)
            </h1>

            {/* Informations du joueur */}
            <div className="w-full max-w-2xl space-y-6 text-lg">
              <div className="flex">
                <span className="font-bold w-64">JOUEUR :</span>
                <span className="border-b border-black flex-1">{displayValue(playerData?.name, '_________________')}</span>
              </div>
              
              <div className="flex">
                <span className="font-bold w-64">NOM :</span>
                <span className="border-b border-black flex-1">{displayValue(playerData?.last_name, '_________________')}</span>
              </div>
              
              <div className="flex">
                <span className="font-bold w-64">PRENOM :</span>
                <span className="border-b border-black flex-1">{displayValue(playerData?.first_name, '_________________')}</span>
              </div>
              
              <div className="flex">
                <span className="font-bold w-64">SEXE :</span>
                <span className="border-b border-black flex-1">{displayValue(playerData?.gender, '_________________')}</span>
              </div>
              
              <div className="flex">
                <span className="font-bold w-64">DATE DE NAISSANCE :</span>
                <span className="border-b border-black flex-1">{displayValue(playerData?.birth_date, '____________')} (JOUR/MOIS/ANNEE)</span>
              </div>
              
              <div className="flex">
                <span className="font-bold w-64">EQUIPE NATIONALE :</span>
                <span className="border-b border-black flex-1">{displayValue(playerData?.national_team, '_________________')}</span>
              </div>
              
              <div className="flex">
                <span className="font-bold w-64">CLUB :</span>
                <span className="border-b border-black flex-1">{displayValue(playerData?.club, '_________________')}</span>
              </div>
              
              <div className="flex">
                <span className="font-bold w-64">PAYS DU CLUB :</span>
                <span className="border-b border-black flex-1">{displayValue(playerData?.country, '_________________')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 - Historique et Antécédents */}
        <div className="report-page">
          <h2 className="text-2xl font-bold mb-6">1. HISTORIQUE DE COMPÉTITION</h2>
          
          <div className="mb-6">
            <div className="flex gap-8 mb-4">
              <div>
                <span className="font-bold">Poste</span>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>Gardien de but</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>Défenseur</span>
                  </label>
                </div>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>Milieu de terrain</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>Attaquant</span>
                  </label>
                </div>
              </div>
              
              <div>
                <span className="font-bold">Pied(s) fort(s)</span>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>gauche</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>droit</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>les deux</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <span className="font-bold">Nombre de matches disputés au cours des 12 derniers mois : </span>
              <span className="border-b border-black inline-block w-32">____________</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 mt-8">2. ANTECEDANTS</h2>
          
          <h3 className="text-xl font-bold mb-4">2.1 PATHOLOGIES ACTUELLES ET PASSÉES</h3>
          
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left p-2 font-bold">Général</th>
                <th className="text-center p-2 font-bold w-24">Non</th>
                <th className="text-center p-2 font-bold w-24">Oui</th>
                <th className="text-left p-2"></th>
              </tr>
            </thead>
            <tbody>
              {[
                'Infections (surtout virales)\n(au cours des quatre dernières semaines)',
                'Diarrhée',
                'Fièvre rhumatismale',
                'Coups de chaleur',
                'Commotions',
                'Allergies'
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="p-2">{item}</td>
                  <td className="text-center p-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                  </td>
                  <td className="text-center p-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                  </td>
                  <td className="p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left p-2 font-bold">Cœur et poumons</th>
                <th className="text-center p-2 font-bold w-24">Non</th>
                <th className="text-center p-2 font-bold w-32">au repos</th>
                <th className="text-center p-2 font-bold w-40">pendant/après l'effort</th>
              </tr>
            </thead>
            <tbody>
              {[
                'Douleur ou oppression thoracique',
                'Souffle court',
                'Palpitations/arythmie',
                'Autres problèmes cardiaques',
                'Vertiges',
                'Syncopes'
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="p-2">{item}</td>
                  <td className="text-center p-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                  </td>
                  <td className="text-center p-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                  </td>
                  <td className="text-center p-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left p-2 font-bold">Autres</th>
                <th className="text-center p-2 font-bold w-24">Non</th>
                <th className="text-center p-2 font-bold w-24">Oui</th>
                <th className="text-left p-2"></th>
              </tr>
            </thead>
            <tbody>
              {[
                'Hypertension',
                'Souffle',
                'Profil lipidique anormal',
                'Crises et épilepsie',
                'Arrêt du sport conseillé',
                'Fatigué plus rapidement que les autres'
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="p-2">{item}</td>
                  <td className="text-center p-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                  </td>
                  <td className="text-center p-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                  </td>
                  <td className="p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4">
            <span className="font-bold">Remarques supplémentaires : </span>
            <div className="border-b border-black mt-2">___________________________________________________________________</div>
          </div>
        </div>

        {/* Page 3 - Examen Physique Général */}
        <div className="report-page">
          <h2 className="text-2xl font-bold mb-6">3. EXAMEN PHYSIQUE GÉNÉRAL</h2>
          
            <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-bold">Taille :</span>
                <span className="border-b border-black flex-1 text-center">{displayValue(pcmaData.height_cm)}</span>
                <span>cm /</span>
                <span className="border-b border-black flex-1 text-center">____</span>
                <span>pouces</span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="font-bold">Poids :</span>
                <span className="border-b border-black flex-1 text-center">{displayValue(pcmaData.weight_kg)}</span>
                <span>kg</span>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold">Glande thyroïde</span>
                </div>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>normal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>anormal</span>
                  </label>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="font-bold">Ganglions lymphatiques/rate</span>
                </div>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>normal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>anormal</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold">Poumons</span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold">Percussion</span>
                </div>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>normal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>anormal</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold">Bruits respiratoires</span>
                </div>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>normal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>anormal</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold">Souffles</span>
                </div>
                <div className="border-b border-black">_______________________</div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold">Veuillez préciser :</span>
                </div>
                <div className="border-b border-black">_______________________</div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold">Abdomen</span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold">Palpation</span>
                </div>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>normal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-5 h-5" />
                    <span>anormal</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold">Veuillez préciser :</span>
                </div>
                <div className="border-b border-black">_______________________</div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              {/* Placeholder pour diagrammes anatomiques */}
              <div className="border-2 border-gray-300 rounded p-4 mb-4">
                <div className="w-48 h-64 flex items-center justify-center text-gray-400">
                  [Diagramme squelette dos]
                </div>
              </div>
              <div className="border-2 border-gray-300 rounded p-4">
                <div className="w-48 h-64 flex items-center justify-center text-gray-400">
                  [Diagramme cage thoracique]
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Symptômes de la maladie de Marfan</h3>
            <div className="flex gap-8">
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled className="w-5 h-5" />
                <span className="font-bold">Non</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled className="w-5 h-5" />
                <span className="font-bold">Oui (veuillez préciser, conformément à l'annexe :</span>
              </label>
            </div>
            <div className="border-b border-black mt-2">___________________________________________________________________</div>
          </div>
        </div>

        {/* Page 4 - Examens Cardiovasculaires */}
        <div className="report-page">
          <h2 className="text-2xl font-bold mb-6">4. EXAMENS CARDIOVASCULAIRES</h2>
          
          <h3 className="text-xl font-bold mb-4">4.1 ECG</h3>
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="font-bold">Date :</span>
              <span className="border-b border-black flex-1">{displayValue(pcmaData.ecg_date, '____________________')}</span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <span className="font-bold">Conclusion :</span>
            </div>
            <div className="border border-black p-4 min-h-[100px]">
              {displayValue(pcmaData.ecg_conclusion, '')}
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4">4.2 ÉCHOCARDIOGRAPHIE</h3>
          
          <div className="mb-6">
            <h4 className="font-bold mb-3">Ventricule gauche :</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <span>VTDVG :</span>
                <span className="border-b border-black flex-1 text-center">{displayValue(pcmaData.vtd_vg_ml)}</span>
                <span>ml</span>
              </div>
              <div className="flex items-center gap-4">
                <span>IVTDVG :</span>
                <span className="border-b border-black flex-1 text-center">____</span>
                <span>ml</span>
              </div>
              <div className="flex gap-8">
                <label className="flex items-center gap-2">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>normal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>anormal</span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <span>FEVG :</span>
                <span className="border-b border-black flex-1 text-center">{displayValue(pcmaData.fevg_percent)}</span>
                <span>%</span>
              </div>
              <div className="flex gap-8">
                <label className="flex items-center gap-2">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>normal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>anormal</span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <span>Fonction diastolique² : </span>
                <label className="flex items-center gap-2 ml-4">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>normal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>anormal</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold mb-3">Ventricule droit :</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span>Dimensions : </span>
                <label className="flex items-center gap-2 ml-4">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>normal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>anormal</span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <span>Fonction : </span>
                <label className="flex items-center gap-2 ml-4">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>normal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>anormal</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold mb-3">Oreillette gauche :</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span>Dimensions : </span>
                <label className="flex items-center gap-2 ml-4">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>normal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" disabled className="w-5 h-5" />
                  <span>anormal</span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <span>LAVI :</span>
                <span className="border-b border-black w-32 text-center">{displayValue(pcmaData.lavi_ml_m2)}</span>
                <span>ml/m²</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold mb-3">Aorte :</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span>Sinus de Valsalva :</span>
                <span className="border-b border-black w-32 text-center">{displayValue(pcmaData.aorta_sinus_mm)}</span>
                <span>mm</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Aorte ascendante :</span>
                <span className="border-b border-black w-32 text-center">{displayValue(pcmaData.aorta_asc_mm)}</span>
                <span>mm</span>
              </div>
            </div>
          </div>

            <div className="mb-6">
            <h4 className="font-bold mb-3">Valves :</h4>
            <div className="border border-black p-4 min-h-[80px]">
              {displayValue(pcmaData.valve_status, '')}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold mb-3">Épanchement péricardique :</h4>
            <div className="border border-black p-4 min-h-[60px]">
              {displayValue(pcmaData.pericardial_effusion, '')}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold mb-3">Conclusion :</h4>
            <div className="border border-black p-4 min-h-[100px]">
              {displayValue(pcmaData.echo_conclusion, '')}
            </div>
          </div>
        </div>

        {/* Page 5 - Examens Biologiques et Aptitude */}
        <div className="report-page">
          <h2 className="text-2xl font-bold mb-6">5. EXAMENS BIOLOGIQUES</h2>
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Hématologie</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="w-40">Hémoglobine :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.hb_g_dl || '____'}</span>
                  <span>g/dL</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">Hématocrite :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.ht_percent || '____'}</span>
                  <span>%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">Leucocytes :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.wbc_g_l || '____'}</span>
                  <span>G/L</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">Plaquettes :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.platelets_g_l || '____'}</span>
                  <span>G/L</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">Ferritine :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.ferritin_ng_ml || '____'}</span>
                  <span>ng/mL</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Métabolisme</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="w-40">Glucose :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.glucose_mg_dl || '____'}</span>
                  <span>mg/dL</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">HbA1c :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.hba1c_percent || '____'}</span>
                  <span>%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">TSH :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.tsh_mui_l || '____'}</span>
                  <span>mUI/L</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">LDL :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.ldl_mg_dl || '____'}</span>
                  <span>mg/dL</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">HDL :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.hdl_mg_dl || '____'}</span>
                  <span>mg/dL</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">Triglycérides :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.tg_mg_dl || '____'}</span>
                  <span>mg/dL</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">Créatinine :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.creat_mg_dl || '____'}</span>
                  <span>mg/dL</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-40">eGFR :</span>
                  <span className="border-b border-black flex-1 text-center">{pcmaData.egfr_ml_min || '____'}</span>
                  <span>mL/min</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 mt-12">6. EXAMEN MUSCULO-SQUELETTIQUE</h2>
          
          <div className="space-y-4 mb-8">
            <div>
              <span className="font-bold">Colonne vertébrale : </span>
              <div className="border border-black p-3 mt-2">{pcmaData.spine || ''}</div>
            </div>
            <div>
              <span className="font-bold">Épaules : </span>
              <div className="border border-black p-3 mt-2">{pcmaData.shoulders || ''}</div>
            </div>
            <div>
              <span className="font-bold">Hanches : </span>
              <div className="border border-black p-3 mt-2">{pcmaData.hips || ''}</div>
            </div>
            <div>
              <span className="font-bold">Genoux : </span>
              <div className="border border-black p-3 mt-2">{pcmaData.knees || ''}</div>
            </div>
            <div>
              <span className="font-bold">Chevilles et pieds : </span>
              <div className="border border-black p-3 mt-2">{pcmaData.ankles_feet || ''}</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 mt-12">7. DÉCISION MÉDICALE</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">APTITUDE :</h3>
            <div className="flex gap-6 flex-wrap">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={pcmaData.aptitude === 'APTE'} 
                  disabled 
                  className="w-5 h-5" 
                />
                <span className="font-bold">APTE</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={pcmaData.aptitude === 'APTE_RESTRICTIONS'} 
                  disabled 
                  className="w-5 h-5" 
                />
                <span className="font-bold">APTE AVEC RESTRICTIONS</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={pcmaData.aptitude === 'TEMP_INAPTE'} 
                  disabled 
                  className="w-5 h-5" 
                />
                <span className="font-bold">TEMPORAIREMENT INAPTE</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={pcmaData.aptitude === 'INAPTE'} 
                  disabled 
                  className="w-5 h-5" 
                />
                <span className="font-bold">INAPTE</span>
              </label>
            </div>
          </div>

          {pcmaData.restrictions && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Restrictions :</h3>
              <div className="border border-black p-4 min-h-[80px]">
                {pcmaData.restrictions}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Recommandations :</h3>
            <div className="border border-black p-4 min-h-[100px]">
              {pcmaData.recommendations || ''}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8">
            <div>
              <div className="mb-2">
                <span className="font-bold">Nom du médecin :</span>
              </div>
              <div className="border-b-2 border-black pb-1">
                {pcmaData.physician_name || ''}
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="font-bold">Signature et cachet :</span>
              </div>
              <div className="border-2 border-black h-32 flex items-center justify-center">
                {pcmaData.signature_attachment_id ? (
                  <span className="text-sm text-gray-500">[Signature]</span>
                ) : (
                  <span className="text-sm text-gray-400">À signer</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page 6 - Références */}
        <div className="report-page">
          <h2 className="text-2xl font-bold mb-6">Appendix</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex gap-4">
                <span className="font-bold">1</span>
                <div>
                  <p className="font-semibold mb-2">The revised Ghent nosology for the Marfan syndrome</p>
                  <p className="text-sm">
                    Please see main publication for details or go to{' '}
                    <a href="https://www.marfan.org/" className="text-blue-600 underline">
                      https://www.marfan.org/
                    </a>
                    .<br />
                    Loeys BL et al. Journal of Medical Genetics 2010;47:476-485
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex gap-4">
                <span className="font-bold">2</span>
                <div>
                  <p className="font-semibold mb-2">
                    International criteria for electrocardiographic interpretation in athletes
                  </p>
                  <p className="text-sm">
                    Please see main publication for details:<br />
                    Drezner JA et al. Br J Sports Med 2017;1:1-28
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex gap-4">
                <span className="font-bold">3</span>
                <div>
                  <p className="font-semibold mb-2">
                    Recommendations for Cardiac Chamber Quantification by Echocardiography in Adults:
                    An Update from the American Society of Echocardiography and the European
                    Association of Cardiovascular Imaging
                  </p>
                  <p className="text-sm">Lang RM et al. J Am Soc Echocardiogr 2015; 28:1-39</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles pour l'impression */}
      <style jsx>{`
        .pcma-report {
          font-family: Arial, sans-serif;
          color: #000;
        }

        .report-page {
          page-break-after: always;
          padding: 2rem;
          background: white;
          min-height: 29.7cm;
        }

        .report-page:last-child {
          page-break-after: auto;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .pcma-report {
            margin: 0;
            padding: 0;
          }

          .report-page {
            margin: 0;
            padding: 1.5cm;
            min-height: auto;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }

        input[type="checkbox"]:disabled {
          opacity: 1;
        }

        table {
          font-size: 0.95rem;
        }

        h1 {
          line-height: 1.3;
        }

        h2 {
          border-bottom: 3px solid #000;
          padding-bottom: 0.5rem;
        }

        h3 {
          text-decoration: underline;
        }
      `}</style>
    </>
  )
}

