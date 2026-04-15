import { ReactNode, useEffect } from 'react'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Sheet */}
      <div className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-white shadow-xl">
        {children}
      </div>
    </>
  )
}

interface SheetContentProps {
  children: ReactNode
}

export function SheetContent({ children }: SheetContentProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {children}
    </div>
  )
}

interface SheetHeaderProps {
  children: ReactNode
}

export function SheetHeader({ children }: SheetHeaderProps) {
  return (
    <div className="border-b border-neutral-200 px-6 py-4">
      {children}
    </div>
  )
}

interface SheetTitleProps {
  children: ReactNode
}

export function SheetTitle({ children }: SheetTitleProps) {
  return (
    <h2 className="text-lg font-semibold text-neutral-900">
      {children}
    </h2>
  )
}
