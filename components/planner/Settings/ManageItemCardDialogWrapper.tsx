import React, { useEffect } from 'react'

import { Dialog } from '@/components/ui/dialog'

export const ManageItemCardDialogWrapper = ({
  children,
  onCloseDialog,
  conditionToOpenDialog,
}: {
  children: React.ReactNode
  onCloseDialog: () => void
  conditionToOpenDialog: boolean
}) => {
  // When the nested AlertDialog confirms a delete, the Dialog and the
  // AlertDialog close in the same update. Radix's dismissable layers race each
  // other's cleanup and can leave `pointer-events: none` on <body>, freezing
  // the page. https://github.com/shadcn-ui/ui/issues/1912
  // Clearing the style once the dialog state has settled to closed (an effect,
  // which runs after Radix's unmount cleanup) fixes this deterministically.
  useEffect(() => {
    if (!conditionToOpenDialog) {
      document.body.style.pointerEvents = ''
    }
  }, [conditionToOpenDialog])

  return (
    <Dialog
      open={conditionToOpenDialog}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          onCloseDialog()
        }
      }}
    >
      {children}
    </Dialog>
  )
}
