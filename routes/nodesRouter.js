import { Router } from 'express'
import { nodesList, registerNode } from '../controllers/nodesController.js'

const router = Router()

router.get('/nodes', nodesList)           //LISTA NODÓW
router.post('/nodes/announce', registerNode) //REJESTRACJA NODA W SYSTEMIE 
router.post('/nodes/historicalSave')   //POBIERA I ZAPISUJE Z NODA STATUS (id, ram, cpu, free_space, total_space, overloaded, timestamp) 

export default router