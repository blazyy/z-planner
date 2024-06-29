import express from 'express'
import db from '../../db/conn.mjs'
import { errorHandler } from '../../middleware/index.mjs'

const router = express.Router()

const addNewCardToColumn = async (req, res) => {
  const userId = req.auth.userId
  const { columnId } = req.params
  const { newTaskCardDetails: newCard, updatedTaskCards } = req.body
  await db.collection('planner').updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`columns.${columnId}.taskCards`]: updatedTaskCards,
        [`taskCards.${newCard.id}`]: newCard,
      },
    }
  )
  res.status(201).end()
}

const changeCardCheckedStatus = async (req, res) => {
  const userId = req.auth.userId
  const { taskCardId } = req.params
  const { isChecked } = req.body
  await db.collection('planner').updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`taskCards.${taskCardId}.checked`]: isChecked,
      },
    }
  )
  res.status(204).end()
}

const changeCardTitle = async (req, res) => {
  const userId = req.auth.userId
  const { taskCardId } = req.params
  const { newTitle } = req.body
  await db.collection('planner').updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`taskCards.${taskCardId}.title`]: newTitle,
      },
    }
  )
  res.status(204).end()
}

const changeCardContent = async (req, res) => {
  const userId = req.auth.userId
  const { taskCardId } = req.params
  const { newContent } = req.body
  await db.collection('planner').updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`taskCards.${taskCardId}.content`]: newContent,
      },
    }
  )
  res.status(204).end()
}

const changeCardCategory = async (req, res) => {
  const userId = req.auth.userId
  const { taskCardId } = req.params
  const { newCategoryId } = req.body
  await db.collection('planner').updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`taskCards.${taskCardId}.category`]: newCategoryId,
      },
    }
  )
  res.status(204).end()
}

const moveCardWithinColumn = async (req, res) => {
  const userId = req.auth.userId
  const { columnId } = req.params
  const { reorderedCardIds } = req.body
  await db
    .collection('planner')
    .updateOne(
      { clerkUserId: userId, [`columns.${columnId}.id`]: columnId },
      { $set: { [`columns.${columnId}.taskCards`]: reorderedCardIds } }
    )
  res.status(204).end()
}

// Function to move a card across different columns
const moveCardAcrossColumns = async (req, res) => {
  const userId = req.auth.userId
  const { sourceColumnId, destColumnId, sourceColumnTaskCardIds, destColumnTaskCardIds } = req.body
  await db.collection('planner').updateMany(
    {
      clerkUserId: userId,
      $or: [{ [`columns.${sourceColumnId}.id`]: sourceColumnId }, { [`columns.${destColumnId}.id`]: destColumnId }],
    },
    {
      $set: {
        [`columns.${sourceColumnId}.taskCards`]: sourceColumnTaskCardIds,
        [`columns.${destColumnId}.taskCards`]: destColumnTaskCardIds,
      },
    }
  )
  res.status(204).end()
}

const deleteCard = async (req, res) => {
  const userId = req.auth.userId
  const { columnId, taskCardId } = req.params
  // Remove the task from the taskCards object using $unset
  await db.collection('planner').updateOne({ clerkUserId: userId }, { $unset: { [`taskCards.${taskCardId}`]: '' } })
  // Remove the task from the taskCards list within the specified column using $pull
  await db
    .collection('planner')
    .updateOne(
      { clerkUserId: userId, [`columns.${columnId}.id`]: columnId },
      { $pull: { [`columns.${columnId}.taskCards`]: taskCardId } }
    )
  res.status(204).end()
}

router.post('/planner/columns/:columnId/cards', errorHandler(addNewCardToColumn))
router.patch('/planner/cards/:taskCardId/checked', errorHandler(changeCardCheckedStatus))
router.patch('/planner/cards/:taskCardId/title', errorHandler(changeCardTitle))
router.patch('/planner/cards/:taskCardId/content', errorHandler(changeCardContent))
router.patch('/planner/cards/:taskCardId/category', errorHandler(changeCardCategory))
router.patch('/planner/columns/:columnId/cards/move', errorHandler(moveCardWithinColumn)) // CHANGE
router.patch('/planner/columns/move', errorHandler(moveCardAcrossColumns))
router.delete('/planner/columns/:columnId/cards/:taskCardId/delete', errorHandler(deleteCard))

export default router
