import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import React, { useState } from 'react'

export const ManageItemAlertDialog = ({
  onCloseParentDialog,
  onClickDelete,
  isDeleteButtonDisabled,
  deleteButtonDisabledTooltipContent,
  deleteConfirmationContent = <span>This action cannot be undone. Are you sure?</span>,
}: {
  onCloseParentDialog: () => void
  onClickDelete: () => void
  isDeleteButtonDisabled: boolean
  deleteButtonDisabledTooltipContent: string
  deleteConfirmationContent?: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        // The stuck `pointer-events: none` on <body> after the simultaneous
        // dialog + alert-dialog close (shadcn-ui/ui#1912) is cleaned up
        // deterministically by ManageItemCardDialogWrapper when the parent
        // dialog closes, so no workaround is needed here.
        if (!newOpen) {
          setIsOpen(false)
        }
      }}
    >
      <div className='flex justify-between items-end gap-2'>
        {!isDeleteButtonDisabled && (
          <Button size='sm' variant='destructive' onClick={() => setIsOpen(true)}>
            Delete
          </Button>
        )}
        {isDeleteButtonDisabled && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              {/* asChild + focusable span: a disabled button swallows pointer events
                  (the tooltip would never fire) and the old wrapper nested a button
                  inside the trigger's own button — invalid HTML. */}
              <TooltipTrigger asChild>
                <span tabIndex={0} className='cursor-default'>
                  <Button size='sm' variant='destructive' disabled={true}>
                    Delete
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{deleteButtonDisabledTooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>{deleteConfirmationContent}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            onClick={() => {
              onCloseParentDialog()
              onClickDelete()
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
