import { Router } from 'express'
import { nodesList, registerNode, historyPush } from '../controllers/nodesController.js'

const router = Router()

router.get('/nodes', nodesList)           //LISTA NODÓW
router.post('/nodes/announce', registerNode) //REJESTRACJA NODA W SYSTEMIE 
router.post('/nodes/historicalPush', historyPush)   //POBIERA I ZAPISUJE Z STATUS WSZYSTKICH ZAREJESTROWANYCH NODE (current_ip, hardware_id, name, total_space, created_at, last_connection, port, timestamp) 
//router.post('/nodes/historicalPush/:id', historyPush)   //POBIERA I ZAPISUJE Z STATUS KONKRETNEGO NODE (current_ip, hardware_id, name, total_space, created_at, last_connection, port, timestamp) 

export default router