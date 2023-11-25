import express from 'express'
import db from '../../db/conn.mjs'

const router = express.Router()

// Subtask moved within card
router.put('/planner/cards/:taskCardId/subtasks/move', async (req, res) => {
  try {
    const username = 'user1'
    const { taskCardId } = req.params
    const { reorderedSubTasks } = req.body
    console.log(taskCardId, reorderedSubTasks)
    const filter = { username, [`taskCards.${taskCardId}.id`]: taskCardId }
    const query = { $set: { [`taskCards.${taskCardId}.subTasks`]: reorderedSubTasks } }
    await db.collection('planner').updateOne(filter, query)
    res.status(204).end() // No Content
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

export default router
