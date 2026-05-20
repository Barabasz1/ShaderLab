import { cn } from '@/lib/utils'

export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-accent text-accent-foreground',
    outline: 'border border-border text-muted-foreground',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-mono font-medium tracking-wide uppercase',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
