import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function FormFieldWithUnit({
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
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          min={min}
          max={max}
          step={step}
          className={cn('pr-16 text-right', error && 'border-destructive')}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{unit}</span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

