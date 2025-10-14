import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/badge'

export function CertificatePreview({
  playerName,
  playerAge,
  playerPosition,
  club,
  status,
  restrictions,
  issueDate,
  expiryDate,
  doctorName,
}) {
  return (
    <Card className="border-2">
      <CardContent className="p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">CERTIFICAT MÉDICAL D'APTITUDE</h2>
          <p className="text-sm text-muted-foreground">À la pratique sportive en compétition</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Player Info */}
          <div className="space-y-2">
            <p className="text-sm">
              Je soussigné(e), <span className="font-semibold">{doctorName}</span>, Docteur en Médecine, certifie avoir
              examiné ce jour :
            </p>
            <div className="ml-4 space-y-1">
              <p>
                <span className="font-medium">Nom et Prénom :</span> {playerName}
              </p>
              <p>
                <span className="font-medium">Âge :</span> {playerAge} ans
              </p>
              <p>
                <span className="font-medium">Poste :</span> {playerPosition}
              </p>
              <p>
                <span className="font-medium">Club :</span> {club}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-lg border-2 bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold">État d'aptitude :</span>
              <StatusBadge status={status} />
            </div>

            {status === 'APTE' && (
              <p className="text-sm">
                L'examen médical effectué ce jour n'a pas révélé de contre-indication à la pratique du football en
                compétition.
              </p>
            )}

            {status === 'APTE_RESTRICTIONS' && (
              <div className="space-y-2">
                <p className="text-sm">
                  L'examen médical effectué ce jour révèle une aptitude avec les restrictions suivantes :
                </p>
                <div className="rounded bg-background p-3">
                  <p className="text-sm font-medium">{restrictions}</p>
                </div>
              </div>
            )}

            {status === 'TEMP_INAPTE' && (
              <div className="space-y-2">
                <p className="text-sm">L'examen médical effectué ce jour révèle une inaptitude temporaire :</p>
                <div className="rounded bg-background p-3">
                  <p className="text-sm font-medium">{restrictions}</p>
                </div>
              </div>
            )}

            {status === 'INAPTE' && (
              <p className="text-sm">
                L'examen médical effectué ce jour révèle une contre-indication à la pratique du football en compétition.
              </p>
            )}
          </div>

          {/* Validity */}
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Date d'émission :</span>{' '}
              {new Date(issueDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="text-sm">
              <span className="font-medium">Date d'expiration :</span>{' '}
              {new Date(expiryDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Validité :</span>
              <Badge variant="outline">6 mois</Badge>
            </div>
          </div>

          {/* Signature */}
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-end">
              <div className="text-center">
                <p className="mb-4 text-sm">Fait le {new Date(issueDate).toLocaleDateString('fr-FR')}</p>
                <div className="mb-2 h-16 w-48 border-b-2 border-foreground/20"></div>
                <p className="text-sm font-medium">{doctorName}</p>
                <p className="text-xs text-muted-foreground">Signature et cachet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
          <p>
            Ce certificat est établi conformément aux dispositions de l'article L. 231-2 du Code du sport et de l'arrêté
            du 24 juillet 2017
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

