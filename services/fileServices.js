import 'dotenv/config'
import FormData from 'form-data'
import axios from 'axios'
import { prisma } from '../lib/prisma.ts'
import { v4 } from 'uuid'

class fileServices {
    async postFiles(req, res){
        const files = req.userFiles
        const path = req.path;

        for (const fileItem of files) {
            try{
                const uuid = v4();
                const selectedNodes = await this.findAviableNodes(fileItem.size); //Select best avable nodes
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
                res.status(400).json({"status":"error","message":"Error in saving", "code":101, "context": error.message})
            }
        }

        return res.json({"status":"ok", "message": "Files uploaded successfully"})
    }

    normalize(values) {
        const min = Math.min(...values);
        const max = Math.max(...values);

        if (max === min) return values.map(() => 0); // brak różnicy

        return values.map(v => (v - min) / (max - min));
    }

    async findAviableNodes (size){
        const nodeService = new nodesServices()
        const nodes = await nodeService.nodeList()

                // 1. Filtr miejsca
        const candidates = nodes.filter(node => {
            const free = node.value.total_space - node.value.used_space;
            return free > fileSize;
        });

        if (candidates.length === 0) return [];

        // 2. Wyciągnięcie metryk
        const cpuVals = candidates.map(n => n.value.cpu_used);
        const ramVals = candidates.map(n => n.value.ram_used);
        const diskVals = candidates.map(n => n.value.disk_used);
        const netVals = candidates.map(n => n.value.net_rx + n.value.net_tx);

        // 3. Normalizacja
        const cpuNorm = this.normalize(cpuVals);
        const ramNorm = this.normalize(ramVals);
        const diskNorm = this.normalize(diskVals);
        const netNorm = this.normalize(netVals);

        // 4. Wagi (możesz dostroić)
        const W = {
            cpu: 0.4,
            ram: 0.25,
            disk: 0.25,
            net: 0.2
        };

        // 5. Score
        const ranked = candidates.map((node, i) => {
            const score =
            W.cpu * cpuNorm[i] +
            W.ram * ramNorm[i] +
            W.disk * diskNorm[i] +
            W.net * netNorm[i];

            return {
                node,
                score
            };
        });

        // 6. Sort (najmniej używany ->> najlepszy)
        ranked.sort((a, b) => a.score - b.score).slice(0, process.env.REPLICATION_FACTOR || 3);
        

        return ranked;
    }

    async getFile(req, res){
        const id = req.params.id

        if(!id) return res.status(400).json({ status: 'error', message: 'Missing file id', code: 102 })

        // Pobierz plik razem z informacjami o lokalizacjach i nodach
        const fileRecord = await prisma.File.findFirst({ where: { id }, include: { locations: { include: { nodes: true } } } })

        if(!fileRecord) return res.status(404).json({ status: 'error', message: 'File not found', code: 103 })

        const locations = fileRecord.locations || []

        if(locations.length === 0) return res.status(404).json({ status: 'error', message: 'No locations for this file', code: 104 })

        // Try each stored location sequentially
        for (const loc of locations) {
            try {
                const node = loc.nodes
                if(!node) continue

                const ip = node.current_ip || node.currentIp || node.ip
                const port = node.port

                if(!ip) continue

                // Zakładamy, że node udostępnia endpoint GET /files/:storage_name
                const url = `http://${ip}:${port}/file/${id}`

                const resp = await axios.get(url, { responseType: 'stream', timeout: 8000 })

                if(resp.status === 200 && resp.data) {
                    // Przekieruj nagłówki i stream do klienta
                    if(resp.headers['content-type']) res.setHeader('Content-Type', resp.headers['content-type'])
                    if(resp.headers['content-length']) res.setHeader('Content-Length', resp.headers['content-length'])
                    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.display_name || fileRecord.storage_name}"`)

                    // Stream danych bezpośrednio do odpowiedzi
                    resp.data.pipe(res)

                    // Zwróć po zakończeniu lub błędzie strumienia
                    return await new Promise((resolve, reject) => {
                        resp.data.on('end', () => resolve())
                        resp.data.on('error', err => reject(err))
                    })
                }

            } catch (err) {
                // Node nie odpowiada lub zwrócił błąd — spróbuj następnego
                console.warn(`getFile: node ${loc.nodes_id || ''} failed: ${err.message || err}`)
                continue
            }
        }

        // Jeżeli żaden node nie odpowiedział
        return res.status(502).json({ status: 'error', message: 'No available node could serve the file', code: 105 })
        
    }
}

export default fileServices