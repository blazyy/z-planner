import { UNASSIGNED_CATEGORY_ID } from '@/constants/constants'
import { z } from 'zod'

/*
 * Single source of truth for API request validation. Every schema mirrors the
 * exact payload the client mutation utils send today (utils/plannerUtils/**),
 * with .strict() so unknown keys are rejected instead of mass-assigned into
 * dotted $set paths.
 */

// Client-minted ids come from NANOID in constants/constants.ts: 17 chars, 0-9a-z.
export const entityId = z.string().regex(/^[0-9a-z]{17}$/, 'must be a 17-character lowercase alphanumeric id')

// The per-board default category uses the literal id 'unassigned'.
export const categoryId = z.union([entityId, z.literal(UNASSIGNED_CATEGORY_ID)])

const name = z.string().min(1).max(200)
const cardTitle = z.string().max(500) // cards/subtasks may legitimately have empty titles while being typed
const cardContent = z.string().max(50000)
const color = z.string().min(1).max(50)
const cardStatus = z.enum(['created', 'completed', 'archived'])

const categoryDetails = z
  .object({
    id: categoryId,
    name,
    color,
  })
  .strict()

// POST /api/planner/boards — addNewBoardToPlanner.ts
export const boardCreate = z
  .object({
    boardId: entityId,
    boardName: name,
    unassignedCategoryDetails: categoryDetails,
  })
  .strict()

// PATCH /api/planner/boards/[boardId] — changeBoardInfo.ts
export const boardPatch = z
  .object({
    newName: name,
  })
  .strict()

// POST /api/planner/boards/[boardId]/columns — addNewColumn.ts
export const columnCreate = z
  .object({
    newColumnDetails: z
      .object({
        id: entityId,
        name,
        taskCards: z.array(entityId),
      })
      .strict(),
    updatedColumns: z.array(entityId),
  })
  .strict()

// PATCH /api/planner/boards/[boardId]/columns/reorder — changeColumnOrder.ts
export const columnReorder = z
  .object({
    newColumnOrder: z.array(entityId),
  })
  .strict()

// PATCH /api/planner/columns/[columnId] — changeColumnName.ts
export const columnPatch = z
  .object({
    newName: name,
  })
  .strict()

// POST /api/planner/boards/[boardId]/categories — addNewCategory.ts
export const categoryCreate = z
  .object({
    newCategoryDetails: categoryDetails,
  })
  .strict()

// PATCH /api/planner/categories/[categoryId] — changeCategoryInfo.ts
export const categoryPatch = z
  .object({
    newName: name,
    newColor: color,
  })
  .strict()

// POST /api/planner/columns/[columnId]/cards — addNewCardToColumn.ts
export const cardCreate = z
  .object({
    newTaskCardDetails: z
      .object({
        id: entityId,
        title: cardTitle,
        category: categoryId,
        content: cardContent,
        status: z.literal('created'),
        subTasks: z.array(entityId),
      })
      .strict(),
    updatedTaskCards: z.array(entityId),
  })
  .strict()

// PATCH /api/planner/cards/[cardId] — changeCardTitle/Content/Category/CheckedStatus.ts
// columnId + taskCardOrder travel together so the check-completes-card flow can
// persist the column reorder it already performs client-side.
export const cardPatch = z
  .object({
    title: cardTitle.optional(),
    content: cardContent.optional(),
    status: cardStatus.optional(),
    category: categoryId.optional(),
    columnId: entityId.optional(),
    taskCardOrder: z.array(entityId).optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'at least one field is required' })
  .refine((body) => (body.columnId === undefined) === (body.taskCardOrder === undefined), {
    message: 'columnId and taskCardOrder must be provided together',
  })

// PATCH /api/planner/cards/[cardId]/move — moveCardAcrossColumns.ts
export const cardMove = z
  .object({
    sourceColumnId: entityId,
    destColumnId: entityId,
    sourceColumnTaskCardIds: z.array(entityId),
    destColumnTaskCardIds: z.array(entityId),
  })
  .strict()

// PATCH /api/planner/columns/[columnId]/cards/reorder — moveCardWithinColumn.ts
export const cardReorder = z
  .object({
    reorderedCardIds: z.array(entityId),
  })
  .strict()

// POST /api/planner/cards/[cardId]/subtasks — addNewSubTaskToCard.ts
export const subTaskCreate = z
  .object({
    newSubTaskDetails: z
      .object({
        id: entityId,
        title: cardTitle,
        checked: z.boolean(),
      })
      .strict(),
    newSubTasksOrder: z.array(entityId),
  })
  .strict()

// PATCH /api/planner/subtasks/[subTaskId] — changeSubTaskTitle/CheckedStatus.ts
export const subTaskPatch = z
  .object({
    title: cardTitle.optional(),
    checked: z.boolean().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'at least one field is required' })

// PATCH /api/planner/cards/[cardId]/subtasks/move — reorderSubtasks.ts
export const subTaskReorder = z
  .object({
    reorderedSubTasks: z.array(entityId),
  })
  .strict()
