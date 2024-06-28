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

const changeBoardName = async (req, res) => {
  const username = getUsername(req)
  const { boardId } = req.params
  const { newName } = req.body

  await db.collection('planner').updateOne(
    { username },
    {
      $set: {
        [`boards.${boardId}.name`]: newName,
      },
    }
  )

  res.status(200).end()
}

router.patch('/planner/boards/:boardId', errorHandler(changeBoardName))
router.post('/planner/boards/', errorHandler(addNewBoard))

export default router
