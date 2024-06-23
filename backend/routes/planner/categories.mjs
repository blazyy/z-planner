import express from 'express'
import db from '../../db/conn.mjs'
import { errorHandler, getUsername } from '../../middleware/index.mjs'

const router = express.Router()

const addNewCategory = async (req, res) => {
  const username = getUsername(req)
  const { newCategoryDetails } = req.body
  await db.collection('planner').updateOne(
    { username },
    {
      $set: {
        [`categories.${newCategoryDetails.id}`]: newCategoryDetails,
      },
    }
  )
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
  const { categoryId } = req.params
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
  res.status(204).end()
}

router.post('/planner/categories', errorHandler(addNewCategory))
router.patch('/planner/categories/:categoryId', errorHandler(changeCategoryInfo))
router.delete('/planner/categories/:categoryId/delete', errorHandler(deleteCategory))

export default router
