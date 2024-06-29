import express from 'express'
import db from '../../db/conn.mjs'
import { errorHandler } from '../../middleware/index.mjs'

const router = express.Router()

const addNewBoard = async (req, res) => {
  const userId = req.auth.userId
  const { boardId, boardName, unassignedCategoryDetails } = req.body
  await db.collection('planner').updateMany(
    { clerkUserId: userId },
    {
      $push: {
        boardOrder: boardId,
      },
      $set: {
        [`boards.${boardId}`]: {
          id: boardId,
          name: boardName,
          columns: [],
          categories: [unassignedCategoryDetails.id],
        },
        [`categories.${unassignedCategoryDetails.id}`]: unassignedCategoryDetails,
      },
    }
  )
  res.status(201).end()
}

const changeBoardName = async (req, res) => {
  const userId = req.auth.userId
  const { boardId } = req.params
  const { newName } = req.body
  await db.collection('planner').updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`boards.${boardId}.name`]: newName,
      },
    }
  )
  res.status(200).end()
}

const deleteBoard = async (req, res) => {
  const userId = req.auth.userId
  const { boardId } = req.params
  await db.collection('planner').updateOne(
    { clerkUserId: userId },
    {
      $pull: {
        boardOrder: boardId,
      },
      $unset: {
        [`boards.${boardId}`]: '',
      },
    }
  )
  res.status(204).end()
}

router.post('/planner/boards/', errorHandler(addNewBoard))
router.patch('/planner/boards/:boardId', errorHandler(changeBoardName))
router.delete('/planner/boards/:boardId', errorHandler(deleteBoard))

export default router
