import { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
}

function Card({
  hover = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles =
    'bg-white rounded-lg border border-neutral-200 transition-shadow duration-200'

  const hoverStyles = hover
    ? 'hover:shadow-card-hover cursor-pointer shadow-card'
    : 'shadow-card'

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const combinedClassName = `${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  )
}

export default Card
