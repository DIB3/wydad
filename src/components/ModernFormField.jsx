import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function ModernFormField({
  label,
  id,
  unit,
  placeholder,
  type = 'number',
  value,
  onChange,
  required,
  min,
  max,
  step,
  error,
  className,
  icon: Icon,
  gradient = 'from-blue-500 to-purple-500'
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(!!value)

  const handleChange = (e) => {
    setHasValue(e.target.value !== '')
    onChange?.(e)
  }

  return (
    <div className={cn('relative space-y-2', className)}>
      {/* Label flottant */}
      <Label 
        htmlFor={id}
        className={cn(
          'transition-all duration-200 flex items-center gap-2 font-medium',
          (isFocused || hasValue) ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Container Input */}
      <div className="relative group">
        {/* Barre de progression gradient au focus */}
        <div 
          className={cn(
            'absolute bottom-0 left-0 h-0.5 bg-gradient-to-r transition-all duration-300',
            gradient,
            isFocused ? 'w-full opacity-100' : 'w-0 opacity-0'
          )}
        />

        {/* Input avec style moderne */}
        <div className="relative">
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            min={min}
            max={max}
            step={step}
            className={cn(
              'pr-16 text-right transition-all duration-200',
              'border-2',
              error && 'border-red-500 focus-visible:ring-red-500',
              isFocused && !error && 'border-primary shadow-md',
              !isFocused && !error && 'border-slate-200',
              'bg-white hover:border-slate-300',
              'focus-visible:ring-2 focus-visible:ring-primary/20'
            )}
          />
          
          {/* Unité avec badge */}
          {unit && (
            <span className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'px-2 py-0.5 rounded-md text-xs font-semibold',
              'transition-all duration-200',
              isFocused 
                ? `bg-gradient-to-r ${gradient} text-white` 
                : 'bg-slate-100 text-slate-600'
            )}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Message d'erreur avec animation */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1 animate-in slide-in-from-left-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}

      {/* Indicateur de valeur valide */}
      {!error && hasValue && !isFocused && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-green-500" />
          Valide
        </p>
      )}
    </div>
  )
}

