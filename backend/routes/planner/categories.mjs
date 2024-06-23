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

router.post('/planner/categories', errorHandler(addNewCategory))
router.patch('/planner/categories/:categoryId', errorHandler(changeCategoryInfo))

export default router
