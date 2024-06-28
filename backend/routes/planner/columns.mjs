import express from 'express'
import db from '../../db/conn.mjs'
import { errorHandler } from '../../middleware/index.mjs'

const router = express.Router()

const addNewColumn = async (req, res) => {
  const userId = req.auth.userId
  const { boardId } = req.params
  const { newColumnDetails: newColumn, updatedColumns } = req.body
  await db.collection('planner').updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`boards.${boardId}.columns`]: updatedColumns,
        [`columns.${newColumn.id}`]: newColumn,
      },
    }
  )
  res.status(201).end()
}

const changeColumnOrder = async (req, res) => {
  const userId = req.auth.userId
  const { boardId } = req.params
  const { newColumnOrder } = req.body
  await db
    .collection('planner')
    .updateOne(
      { clerkUserId: userId, [`boards.${boardId}.id`]: boardId },
      { $set: { [`boards.${boardId}.columns`]: newColumnOrder } }
    )
  res.status(204).end()
}

const deleteColumn = async (req, res) => {
  const userId = req.auth.userId
  const { boardId, columnId } = req.params
  await db.collection('planner').updateOne(
    { clerkUserId: userId },
    {
      $pull: {
        [`boards.${boardId}.columns`]: columnId,
      },
      $unset: {
        [`columns.${columnId}`]: 1,
      },
    }
  )
  res.status(204).end()
}

const changeColumnName = async (req, res) => {
  const userId = req.auth.userId
  const { columnId } = req.params
  const { newName } = req.body
  await db.collection('planner').updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`columns.${columnId}.name`]: newName,
      },
    }
  )
  res.status(204).end()
}

router.patch('/planner/columns/:columnId', errorHandler(changeColumnName))
router.post('/planner/boards/:boardId/columns', errorHandler(addNewColumn))
router.patch('/planner/boards/:boardId/columns/reorder', errorHandler(changeColumnOrder))
router.delete('/planner/boards/:boardId/columns/:columnId/delete', errorHandler(deleteColumn))

export default router
