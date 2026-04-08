import nodesServices from '../services/nodesServices.js'

export const nodesList = async (req, res) => {
    try {
        const ser = new nodesServices()
        const output = await ser.nodeList()
        res.json(output)
    }
    catch (error){
        res.status(400).json({"status":"error","message":"Something went wrong", "context": error.message})
    }
}

export const registerNode = async (req, res) => {
    try {
        const ser = new nodesServices
        const output = await ser.registerNode(req.body)
        res.json(output)
    }
    catch (error){
        res.status(400).json({"status":"error","message":"Something went wrong", "context": error})
    }
}

export const historyPush = async (req, res) => {
    try {
        const ser = new nodesServices()
        const output = await ser.nodeHistoryPush(req)
        res.json(output)
    }
    catch (error){
        res.status(400).json({"status":"error","message":"Something went wrong", "context": error})
    }
}