import fileServices from "../services/fileServices"

export const postFiles = async (req, res) => {
    try{
        const { file, user, path } = req
        // TODO: ADD USER VERYFICATION
        const cs = new fileServices()
        const cluster = await cs.postFiles(req)
        res.send(cluster)
    } 
    catch (error) {
        res.status(400).json({"status":"error","message":"Something went wrong","code":100, "context": error})
    }
}

export const getFile = async (req, res) => {
    try{
        const { user } = req
        // TODO: ADD USER VERYFICATION
        const cs = new fileServices
        const cluster = await cs.getFile(req)
        res.send(cluster)
    } 
    catch (error) {
        res.status(400).json({"status":"error","message":"Something went wrong","code":100, "context": error})
    }
}

export const getFolder = async (req, res) => {
    try{
        const { user } = req
        // TODO: ADD USER VERYFICATION
        const cs = new fileServices()
        const cluster = await cs.getFolder(req)
        res.send(cluster)
    } 
    catch (error) {
        res.status(400).json({"status":"error","message":"Something went wrong","code":100, "context": error})
    }
}