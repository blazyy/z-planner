import { Dialog } from '@/components/ui/dialog'
import React, { useEffect, useState } from 'react'

export const ManageItemCardDialogWrapper = ({
  children,
  onCloseDialog,
  conditionToOpenDialog,
}: {
  children: React.ReactNode
  onCloseDialog: () => void
  conditionToOpenDialog: boolean
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (conditionToOpenDialog) {
      setIsDialogOpen(true)
    }
  }, [conditionToOpenDialog])

  function onOpenChangeHandler(newOpen: boolean) {
    // shadcn / Radix UI is awful with nested dialogs. What a pain.
    // https://github.com/shadcn-ui/ui/issues/1912#issuecomment-2187447622
    // The setTimeout is a workaround for a bug where after you clicked on an action on the alert dialog,
    // both dialogs would close but the page would become unresponsive-- you couldn't click on anything.
    if (!newOpen) {
      onCloseDialog()
      setIsDialogOpen(false)
    }
    setTimeout(() => {
      if (!newOpen) {
        document.body.style.pointerEvents = ''
      }
    }, 100)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChangeHandler}>
      {children}
    </Dialog>
  )
}
