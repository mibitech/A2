import { HTMLAttributes, ReactNode } from 'react'

export interface IconWithTextProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode
  title: string
  description: string
  iconColor?: string
}

function IconWithText({
  icon,
  title,
  description,
  iconColor = 'text-brand',
  className = '',
  ...props
}: IconWithTextProps) {
  return (
    <div className={`flex items-start gap-3 ${className}`} {...props}>
      <div className={`h-10 w-10 flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
    </div>
  )
}

export default IconWithText
