import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ModuleProgressIndicator({ moduleProgress, moduleSequence, currentModuleIndex }) {
  if (!moduleProgress) return null

  return (
    <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden animate-in slide-in-from-top-4 duration-500">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header avec progression */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {moduleProgress.current}
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">{moduleProgress.total}</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900">
                  Module {moduleProgress.current} sur {moduleProgress.total}
                </h3>
                <p className="text-sm text-blue-700 font-medium">
                  {moduleProgress.isLast ? 'Dernier module' : 'Navigation en cours...'}
                </p>
              </div>
            </div>

            {/* Prochain module */}
            {!moduleProgress.isLast && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-300 rounded-xl shadow-md">
                <ChevronRight className="h-5 w-5 text-emerald-700 animate-pulse" />
                <div className="text-left">
                  <p className="text-xs text-emerald-700 font-semibold">Prochain</p>
                  <p className="text-sm font-bold text-emerald-900">
                    {moduleSequence[currentModuleIndex + 1]?.moduleId.toUpperCase()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Barre de progression */}
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${(moduleProgress.current / moduleProgress.total) * 100}%` }}
              >
                <div className="h-full w-full bg-white/20 animate-pulse" />
              </div>
            </div>
            <div className="absolute -top-1 right-0 text-xs font-bold text-blue-600">
              {Math.round((moduleProgress.current / moduleProgress.total) * 100)}%
            </div>
          </div>

          {/* Séquence des modules */}
          <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
            {moduleSequence.map((module, index) => {
              const isPast = index < currentModuleIndex
              const isCurrent = index === currentModuleIndex
              const isFuture = index > currentModuleIndex

              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 shadow-md',
                      isPast && 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-95',
                      isCurrent && 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white scale-110 shadow-xl ring-4 ring-blue-200',
                      isFuture && 'bg-gray-100 text-gray-500 scale-90'
                    )}
                  >
                    {isPast && <CheckCircle2 className="h-4 w-4" />}
                    {isCurrent && <Circle className="h-4 w-4 animate-pulse fill-current" />}
                    {isFuture && <Circle className="h-4 w-4" />}
                    <span className={cn(
                      'text-xs font-bold uppercase tracking-wider',
                      isCurrent && 'text-white'
                    )}>
                      {module.moduleId}
                    </span>
                  </div>
                  {index < moduleSequence.length - 1 && (
                    <ChevronRight 
                      className={cn(
                        'h-4 w-4 transition-all',
                        index < currentModuleIndex ? 'text-green-500' : 
                        index === currentModuleIndex ? 'text-blue-600 animate-pulse' : 
                        'text-gray-400'
                      )} 
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Message d'encouragement */}
          {!moduleProgress.isLast && (
            <div className="text-center pt-2">
              <p className="text-sm text-blue-700 font-medium">
                💪 Plus que <span className="font-bold text-blue-900">{moduleProgress.total - moduleProgress.current}</span> module{moduleProgress.total - moduleProgress.current > 1 ? 's' : ''} à compléter
              </p>
            </div>
          )}

          {moduleProgress.isLast && (
            <div className="text-center pt-2">
              <p className="text-sm text-green-700 font-bold">
                🎉 Dernier module ! Vous avez presque terminé !
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

