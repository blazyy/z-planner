import express from 'express'
import db from '../../db/conn.mjs'

const router = express.Router()

// Card moved within column
router.put('/planner/columns/:columnId/cards/move', async (req, res) => {
  try {
    const { columnId } = req.params
    const { reorderedCardIds } = req.body
    await db
      .collection('boards')
      .updateOne(
        { [`columns.${columnId}.id`]: columnId },
        { $set: { [`columns.${columnId}.taskCards`]: reorderedCardIds } }
      )
    res.status(200)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

export default router
