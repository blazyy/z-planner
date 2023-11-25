import express from 'express'
import db from '../../db/conn.mjs'

const router = express.Router()

// New card added

// Card moved within column
router.put('/planner/columns/:columnId/cards/move', async (req, res) => {
  try {
    const username = 'user1'
    const { columnId } = req.params
    const { reorderedCardIds } = req.body
    const filter = { username, [`columns.${columnId}.id`]: columnId }
    const query = { $set: { [`columns.${columnId}.taskCards`]: reorderedCardIds } }
    await db.collection('planner').updateOne(filter, query)
    res.status(204).end() // No Content
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

// Card moved across different columns
router.put('/planner/columns/move', async (req, res) => {
  try {
    const username = 'user1'
    const { sourceColumnId, destColumnId, sourceColumnTaskCardIds, destColumnTaskCardIds } = req.body
    const filter = {
      username,
      $or: [{ [`columns.${sourceColumnId}.id`]: sourceColumnId }, { [`columns.${destColumnId}.id`]: destColumnId }],
    }
    const query = {
      $set: {
        [`columns.${sourceColumnId}.taskCards`]: sourceColumnTaskCardIds,
        [`columns.${destColumnId}.taskCards`]: destColumnTaskCardIds,
      },
    }
    await db.collection('planner').updateMany(filter, query)
    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

export default router
