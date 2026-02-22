import { Router } from 'express'

const router = Router()

router.get('/nodes')           //LISTA NODÓW
router.post('/nodes/announce') //REJESTRACJA NODA W SYSTEMIE 
router.post('/nodes/status')   //POBIERA I ZAPISUJE Z NODA STATUS (id, ram, cpu, free_space, total_space, overloaded, timestamp) 

export default router