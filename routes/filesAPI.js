import { Router } from 'express'
import multer from 'multer'
import { getFile, postFiles, getFolder } from '../controllers/filesController.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() });

// TODO :id to Resource Token z zaszytym userID jaki wysyła prośbę i uuid pliku/folderu do jakiego chce się dostać i z datą ważności (wartość w TOKENER)

router.get('/files/:id', getFile) //Get a file by its name
router.post('/files', upload.fields([{name: 'userFiles' }]), postFiles) //Upload a file to the system, the file will be distributed to the nodes based on their available space and load

router.get('/folder/:id', getFolder) //Get a folder by its name, the response will contain the list of files in the folder and their metadata (size, creation date, etc.) and the nodes where they are stored

export default router