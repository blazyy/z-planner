import express from 'express'
import db from '../../db/conn.mjs'
import { errorHandler, getUsername } from '../../middleware/index.mjs'

const router = express.Router()

// Add new column to board TODO:
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
const changeColumnOrder = async (req, res) => {
  const username = getUsername(req)
  const { boardId } = req.params
  const { newColumnOrder } = req.body
  await db
    .collection('planner')
    .updateOne(
      { username, [`boards.${boardId}.id`]: boardId },
      { $set: { [`boards.${boardId}.columns`]: newColumnOrder } }
    )
}

router.patch('/planner/boards/:boardId/columns/reorder', errorHandler(changeColumnOrder))

export default router
