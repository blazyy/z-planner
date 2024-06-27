import express from 'express'
import db from '../../db/conn.mjs'
import { errorHandler, getUsername } from '../../middleware/index.mjs'

const router = express.Router()

const addNewCategory = async (req, res) => {
  const username = getUsername(req)
  const { boardId } = req.params
  const { newCategoryDetails } = req.body
  await db.collection('planner').updateOne(
    { username },
    {
      $set: {
        [`categories.${newCategoryDetails.id}`]: newCategoryDetails,
      },
    }
  )
  await db
    .collection('planner')
    .updateOne({ username }, { $push: { [`boards.${boardId}.categories`]: newCategoryDetails.id } })
  res.status(201).end()
}

const changeCategoryInfo = async (req, res) => {
  const username = getUsername(req)
  const { categoryId } = req.params
  const { newName, newColor } = req.body
  await db.collection('planner').updateOne(
    { username },
    {
      $set: {
        [`categories.${categoryId}.name`]: newName,
        [`categories.${categoryId}.color`]: newColor,
      },
    }
  )
  res.status(201).end()
}

const deleteCategory = async (req, res) => {
  const username = getUsername(req)
  const { boardId, categoryId } = req.params
  const docs = await db.collection('planner').findOne({ username })
  const updateObject = {}
  for (const [key, value] of Object.entries(docs.taskCards)) {
    if (value.category === categoryId) {
      updateObject[`taskCards.${key}.category`] = 'unassigned'
    }
  }
  if (Object.keys(updateObject).length === 0) {
    return
  }
  await db.collection('planner').updateOne({ username: username }, { $set: updateObject })
  await db.collection('planner').updateOne({ username }, { $unset: { [`categories.${categoryId}`]: '' } })
  await db.collection('planner').updateOne({ username }, { $pull: { [`boards.${boardId}.categories`]: categoryId } })
  res.status(204).end()
}

router.post('/planner/boards/:boardId/categories', errorHandler(addNewCategory))
router.patch('/planner/categories/:categoryId', errorHandler(changeCategoryInfo))
router.delete('/planner/boards/:boardId/categories/:categoryId', errorHandler(deleteCategory))

export default router
