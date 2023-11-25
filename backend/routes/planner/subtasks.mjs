import express from 'express'
import db from '../../db/conn.mjs'
import { errorHandler, getUsername } from '../../middleware/index.mjs'

const router = express.Router()

const addNewSubTaskToCard = async (req, res) => {
  const username = getUsername(req)
  const { taskCardId } = req.params
  const { newSubTaskDetails: newSubTask, newSubTasksOrder } = req.body
  await db.collection('planner').updateOne(
    { username },
    {
      $set: {
        [`taskCards.${taskCardId}.subTasks`]: newSubTasksOrder,
        [`subTasks.${newSubTask.id}`]: newSubTask,
      },
    }
  )
  res.status(201).end()
}

const changeSubTaskCheckedStatus = async (req, res) => {
  const username = getUsername(req)
  const { subTaskId } = req.params
  const { isChecked } = req.body
  await db.collection('planner').updateOne(
    { username },
    {
      $set: {
        [`subTasks.${subTaskId}.checked`]: isChecked,
      },
    }
  )
  res.status(204).end()
}

const changeSubTaskTitle = async (req, res) => {
  const username = getUsername(req)
  const { subTaskId } = req.params
  const { newTitle } = req.body
  await db.collection('planner').updateOne(
    { username },
    {
      $set: {
        [`subTasks.${subTaskId}.title`]: newTitle,
      },
    }
  )
  res.status(204).end()
}

const moveSubtaskWithinCard = async (req, res) => {
  const username = getUsername(req)
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

router.post('/planner/cards/:taskCardId/subtasks', errorHandler(addNewSubTaskToCard))
router.patch('/planner/subtasks/:subTaskId/checked', errorHandler(changeSubTaskCheckedStatus))
router.patch('/planner/subtasks/:subTaskId/title', errorHandler(changeSubTaskTitle))
router.patch('/planner/cards/:taskCardId/subtasks/move', errorHandler(moveSubtaskWithinCard))

export default router
