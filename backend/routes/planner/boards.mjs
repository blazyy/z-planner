import express from 'express'
import db from '../../db/conn.mjs'
import { errorHandler, getUsername } from '../../middleware/index.mjs'

const router = express.Router()

const addNewBoard = async (req, res) => {
  const username = getUsername(req)
  const { newBoardDetails: newBoard, newBoardOrder } = req.body

  await db.collection('planner').updateOne(
    { username },
    {
      $set: {
        boardOrder: newBoardOrder,
        [`boards.${newBoard.id}`]: newBoard,
      },
    }
  )

  res.status(201).end()
}

router.post('/planner/boards/', errorHandler(addNewBoard))

export default router
