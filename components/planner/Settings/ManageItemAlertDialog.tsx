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
        if (!newOpen) {
          setIsOpen(false)
        }
        // https://github.com/shadcn-ui/ui/issues/1912#issuecomment-2187447622
        // The setTimeout is a workaround for a bug where after you clicked on an action on the alert dialog,
        // both dialogs would close but the page would become unresponsive-- you couldn't click on anything.
        setTimeout(() => {
          if (!newOpen) {
            document.body.style.pointerEvents = ''
          }
        }, 100)
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
              <TooltipTrigger className='cursor-default'>
                <Button size='sm' variant='destructive' disabled={true}>
                  Delete
                </Button>
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
