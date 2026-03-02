import { FormData } from 'form-data'
import { prisma } from '@prisma/client'
import { v4 } from 'uuid'

class fileServices {
    async postFiles(req, res){
        const files = req.userFiles
        const path = req.path;

        for (const fileItem of files) {
            try{
                const uuid = v4();
                const selectedNodes = findAviableNodes(fileItem.size); //Select best avable nodes
                const form = new FormData();

                const transaction = await prisma.$transaction(async (tx) => {
                    // 1. Tworzysz wpis w tabeli File
                    const fileRecord = await tx.file.create({
                        data: {
                            display_name: fileItem.orginalname,
                            storage_name: uuid+".dat",
                            size: fileItem.size,
                            folder_id: path,
                            user_id: req.user,
                            
                            locations: {
                                create: selectedNodes
                            } 
                        }
                    });
                })

                form.append('file', fileItem.buffer, { filename: uuid });

                let upload_status = []
                for (const node of selectedNodes) {
                    const response = await axios.post(`http://${node.ip}`);

                    if(response.status == 201) {
                        // Edycja wpisu w tabeli FileLocation dla danego node
                        upload_status.push({
                            node_id: node.id,
                            state: done
                        })
                    }
                }

            } catch(error) {
                res.status(400).json({"status":"error","message":"Error in saving", "code":101, "context": error})
            }
        }
    }

    findAviableNodes(size){
        return null
    }
}

export default fileServices