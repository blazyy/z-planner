import { describe, expect, it } from 'vitest'

import { ephemeralReducer } from './ephemeralReducer'
import { EphemeralStateType } from './types'

/*
 * Pins the ephemeral UI reducer that was split out of plannerReducer in the
 * bug-4 refactor. Covers every EphemeralAction (load gate, subtask-drag flag,
 * and the task-card initialization flow) plus immer immutability. Mirrors the
 * rigor of plannerReducer.characterization.test.ts for the flags it used to own.
 */

const baseState = (): EphemeralStateType => ({
  hasLoaded: false,
  isSubTaskBeingDragged: false,
  taskCardBeingInitialized: null,
  dataEnteredInTaskCardBeingInitialized: false,
  loadedBoardIds: {},
})

describe('ephemeralReducer — load gate', () => {
  it('dataLoaded flips hasLoaded to true and leaves the rest untouched', () => {
    const next = ephemeralReducer(baseState(), { type: 'dataLoaded' })
    expect(next.hasLoaded).toBe(true)
    expect(next.isSubTaskBeingDragged).toBe(false)
    expect(next.taskCardBeingInitialized).toBeNull()
    expect(next.dataEnteredInTaskCardBeingInitialized).toBe(false)
    expect(next.loadedBoardIds).toEqual({})
  })
})

describe('ephemeralReducer — per-board lazy-load tracking', () => {
  it('boardLoaded marks a board id loaded without touching others', () => {
    const next = ephemeralReducer(baseState(), { type: 'boardLoaded', payload: { boardId: 'board1' } })
    expect(next.loadedBoardIds).toEqual({ board1: true })

    const next2 = ephemeralReducer(next, { type: 'boardLoaded', payload: { boardId: 'board2' } })
    expect(next2.loadedBoardIds).toEqual({ board1: true, board2: true })
  })

  it('boardLoaded is idempotent for an already-loaded board', () => {
    const once = ephemeralReducer(baseState(), { type: 'boardLoaded', payload: { boardId: 'board1' } })
    const twice = ephemeralReducer(once, { type: 'boardLoaded', payload: { boardId: 'board1' } })
    expect(twice.loadedBoardIds).toEqual({ board1: true })
  })
})

describe('ephemeralReducer — subtask drag flag', () => {
  it('subTaskDragStatusChanged sets isSubTaskBeingDragged both ways', () => {
    const on = ephemeralReducer(baseState(), { type: 'subTaskDragStatusChanged', payload: true })
    expect(on.isSubTaskBeingDragged).toBe(true)
    const off = ephemeralReducer(on, { type: 'subTaskDragStatusChanged', payload: false })
    expect(off.isSubTaskBeingDragged).toBe(false)
  })
})

describe('ephemeralReducer — task card initialization flow', () => {
  it('newTaskCardInitialized stores the initialization descriptor verbatim', () => {
    const descriptor = { taskCardId: 'cardNew', columnId: 'col1', isHighlighted: false }
    const next = ephemeralReducer(baseState(), { type: 'newTaskCardInitialized', payload: descriptor })
    expect(next.taskCardBeingInitialized).toEqual(descriptor)
  })

  it('taskCardBeingInitializedHighlightStatusChange flips isHighlighted on the active descriptor', () => {
    const start: EphemeralStateType = {
      ...baseState(),
      taskCardBeingInitialized: { taskCardId: 'cardNew', columnId: 'col1', isHighlighted: false },
    }
    const next = ephemeralReducer(start, { type: 'taskCardBeingInitializedHighlightStatusChange', payload: true })
    expect(next.taskCardBeingInitialized).toEqual({ taskCardId: 'cardNew', columnId: 'col1', isHighlighted: true })
  })

  it('taskCardInitializationCancelled clears the descriptor to null', () => {
    const start: EphemeralStateType = {
      ...baseState(),
      taskCardBeingInitialized: { taskCardId: 'cardNew', columnId: 'col1', isHighlighted: true },
    }
    const next = ephemeralReducer(start, { type: 'taskCardInitializationCancelled' })
    expect(next.taskCardBeingInitialized).toBeNull()
  })

  it('dataEnteredInTaskCardBeingInitializedStatusChanged sets the boolean flag both ways', () => {
    const on = ephemeralReducer(baseState(), {
      type: 'dataEnteredInTaskCardBeingInitializedStatusChanged',
      payload: true,
    })
    expect(on.dataEnteredInTaskCardBeingInitialized).toBe(true)
    const off = ephemeralReducer(on, {
      type: 'dataEnteredInTaskCardBeingInitializedStatusChanged',
      payload: false,
    })
    expect(off.dataEnteredInTaskCardBeingInitialized).toBe(false)
  })
})

describe('ephemeralReducer — immutability of source state (immer)', () => {
  it('does not mutate prior state across a representative spread of actions', () => {
    const actions = [
      { type: 'dataLoaded' },
      { type: 'subTaskDragStatusChanged', payload: true },
      { type: 'newTaskCardInitialized', payload: { taskCardId: 'cardNew', columnId: 'col1', isHighlighted: false } },
      { type: 'dataEnteredInTaskCardBeingInitializedStatusChanged', payload: true },
    ] as const

    for (const action of actions) {
      const before = baseState()
      const frozen = structuredClone(before)
      ephemeralReducer(before, action)
      expect(before).toEqual(frozen)
    }
  })
})
