import nodesServices from '../services/nodesServices.js'

export const nodesList = async (req, res) => {
    try {
        const ser = new nodesServices()
        const output = ser.nodesList()
        res.json(output)
    }
    catch (error){
        res.status(400).json({"status":"error","message":"Something went wrong", "context": error})
    }
}

export const registerNode = async (req, res) => {
    try {
        const ser = new nodesServices()
        const output = ser.registerNode(req, res)
        res.json(output)
    }
    catch (error){
        res.status(400).json({"status":"error","message":"Something went wrong", "context": error})
    }
}