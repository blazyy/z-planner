import express from 'express'
import db from '../../db/conn.mjs'
import { errorHandler } from '../../middleware/index.mjs'

const router = express.Router()

// Subtask moved within card
const moveSubtaskWithinCard = async (req, res) => {
  const username = 'user1'
  const { taskCardId } = req.params
  const { reorderedSubTasks } = req.body
  await db
    .collection('planner')
    .updateOne(
      { username, [`taskCards.${taskCardId}.id`]: taskCardId },
      { $set: { [`taskCards.${taskCardId}.subTasks`]: reorderedSubTasks } }
    )
  res.status(204).end()
}

router.patch('/planner/cards/:taskCardId/subtasks/move', errorHandler(moveSubtaskWithinCard))

export default router
