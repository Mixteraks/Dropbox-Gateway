import nodesServices from '../services/nodesServices.ts'

export const nodesList = async (req, res) => {
    try {
        const ser = new nodesServices()
        const output = ser.nodesList()
        res.json(output)
    }
    catch (error){
        res.status(301).json({"status":"error","message":"Something went wrong", "context": error})
    }
}