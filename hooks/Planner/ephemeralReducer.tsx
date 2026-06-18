import { Draft, produce } from 'immer'

import { EphemeralAction, EphemeralStateType } from './types'

export const ephemeralReducer = produce((draft: Draft<EphemeralStateType>, action: EphemeralAction) => {
  switch (action.type) {
    case 'dataLoaded': {
      draft.hasLoaded = true
      break
    }
    case 'boardLoaded': {
      // Mark a board's heavy slice as loaded so its page can stop showing the
      // skeleton and the mount effect won't re-fetch it.
      draft.loadedBoardIds[action.payload.boardId] = true
      break
    }
    case 'subTaskDragStatusChanged': {
      draft.isSubTaskBeingDragged = action.payload
      break
    }
    case 'newTaskCardInitialized': {
      draft.taskCardBeingInitialized = action.payload
      break
    }
    case 'taskCardInitializationCancelled': {
      draft.taskCardBeingInitialized = null
      break
    }
    case 'taskCardBeingInitializedHighlightStatusChange': {
      draft.taskCardBeingInitialized!.isHighlighted = action.payload
      break
    }
    case 'dataEnteredInTaskCardBeingInitializedStatusChanged': {
      draft.dataEnteredInTaskCardBeingInitialized = action.payload
      break
    }
    default: {
      // Exhaustiveness check: a new EphemeralAction without a case here is a compile error.
      const unhandled: never = action
      return unhandled
    }
  }
})
