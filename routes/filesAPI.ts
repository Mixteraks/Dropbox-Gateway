import { Router } from 'express'
import { getFile, postFile, getFolder } from '../controllers/filesController.ts'

const router = Router()

router.get('/files/:file', getFile)
router.post('/file', postFile)

router.get('/files/:folder', getFolder)

export default router