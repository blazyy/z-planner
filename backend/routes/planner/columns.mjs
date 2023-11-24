import express from 'express'
import db from '../../db/conn.mjs'

const router = express.Router()

// Add new column to board
router.post('/planner/boards/:boardId/columns', async (req, res) => {
  try {
    const { boardId } = req.params
    const { newColumnId, newColumnName } = req.body
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

// Reorder column within board
router.put('/planner/boards/:boardId/columns/reorder', async (req, res) => {
  try {
    const { boardId } = req.params
    const { newColumnOrder } = req.body
    const filter = { [`boards.${boardId}.id`]: boardId }
    const update = { $set: { [`boards.${boardId}.columns`]: newColumnOrder } }
    const results = await db.collection('planner').updateOne(filter, update)
    res.status(200)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

export default router
