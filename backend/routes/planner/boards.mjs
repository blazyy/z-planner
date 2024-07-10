import express from 'express'
import db from '../../db/conn.mjs'
import { errorHandler } from '../../middleware/index.mjs'

const router = express.Router()

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

router.delete('/planner/boards/:boardId', errorHandler(deleteBoard))

export default router
