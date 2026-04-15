import { HTMLAttributes } from 'react'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'info' | 'warning' | 'neutral'
  icon?: React.ReactNode
}

function Tag({
  variant = 'neutral',
  icon,
  className = '',
  children,
  ...props
}: TagProps) {
  const baseStyles =
    'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded'

  const variantStyles = {
    success: 'bg-success-light text-success-dark',
    info: 'bg-info-light text-info-dark',
    warning: 'bg-warning-light text-warning-dark',
    neutral: 'bg-neutral-100 text-neutral-700',
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`

  return (
    <span className={combinedClassName} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}

export default Tag
