import 'dotenv/config'
import FormData from 'form-data'
import axios from 'axios'
import { prisma } from '../lib/prisma.ts'
import { v4 } from 'uuid'
import nodesServices from './nodesServices.js'

class fileServices {
    async postFiles(req){
        const files = req.files?.userFiles || []
        const folderId = req.body?.folderId || req.body?.folder_id || null
        const userId = typeof req.user === 'string' ? req.user : req.user?.id

        if (files.length === 0) {
            throw new Error('No files provided for upload')
        }

        if (!userId) {
            throw new Error('Missing user id')
        }

        const results = []

        for (const fileItem of files) {
            const uuid = v4()
            const selectedNodes = await this.findAviableNodes(fileItem.size)

            if (selectedNodes.length == = 0) {
                throw new Error('No available nodes with enough space for upload')
            }

            const fileRecord = await prisma.$transaction(async (tx) => {
                return await tx.File.create({
                    data: {
                        display_name: fileItem.originalname || fileItem.orginalname || uuid,
                        storage_name: `${uuid}.dat`,
                        size: BigInt(fileItem.size),
                        folder_id: folderId || undefined,
                        user_id: userId,
                        locations: {
                            create: selectedNodes.map(node => ({
                                nodes_id: node.id,
                                status: 'uploading'
                            }))
                        }
                    }
                })
            })

            const locations = await prisma.FileLocation.findMany({ where: { file_id: fileRecord.id } })
            const uploadedTo = []

            for (const node of selectedNodes) {
                const nodeLocation = locations.find(loc => loc.nodes_id === node.id)
                if (!nodeLocation) continue

                const nodeIp = node.current_ip || node.currentIp || node.ip
                const nodePort = node.port || 80
                const uploadUrl = `http://${nodeIp}:${nodePort}/files`
                const nodeForm = new FormData()

                nodeForm.append('file', fileItem.buffer, { filename: fileRecord.storage_name })
                nodeForm.append('storage_name', fileRecord.storage_name)
                nodeForm.append('file_id', fileRecord.id)

                try {
                    const response = await axios.post(uploadUrl, nodeForm, {
                        headers: nodeForm.getHeaders(),
                        maxBodyLength: Infinity,
                        timeout: 15000
                    })

                    const status = response.status === 201 ? 'done' : 'corrupted'

                    await prisma.FileLocation.update({
                        where: { id: nodeLocation.id },
                        data: { status }
                    })

                    if (status === 'done') {
                        uploadedTo.push({ nodeId: node.id, status })
                    }
                } catch (error) {
                    await prisma.FileLocation.update({
                        where: { id: nodeLocation.id },
                        data: { status: 'corrupted' }
                    })
                }
            }

            results.push({
                fileId: fileRecord.id,
                display_name: fileRecord.display_name,
                storage_name: fileRecord.storage_name,
                uploadedTo
            })
        }

        return {
            status: 'ok',
            message: 'Files uploaded successfully',
            files: results
        }
    }

    normalize(values) {
        const min = Math.min(...values);
        const max = Math.max(...values);

        if (max === min) return values.map(() => 0); // brak różnicy

        return values.map(v => (v - min) / (max - min));
    }

async findAviableNodes(size){
        const nodeService = new nodesServices()
        const nodes = await nodeService.nodeList()

        const candidates = nodes.map(node => {
            const totalSpace = node.value?.total_space ? BigInt(node.value.total_space) : undefined
            const usedSpace = node.value?.used_space ? BigInt(node.value.used_space) : undefined

            if (typeof totalSpace === 'undefined' || typeof usedSpace === 'undefined') {
                return null
            }

            const freeSpace = totalSpace - usedSpace
            const fileSize = BigInt(size)
            if (freeSpace < fileSize) {
                return null
            }

            return {
                node,
                metrics: {
                    cpu: Number(node.value?.cpu_used || 0),
                    ram: Number(node.value?.ram_used || 0),
                    disk: Number(node.value?.disk_used || 0),
                    net: Number(node.value?.net_rx || 0) + Number(node.value?.net_tx || 0)
                }
            }
        }).filter(Boolean)

        if (candidates.length === 0) return []

        const cpuVals = candidates.map(c => c.metrics.cpu)
        const ramVals = candidates.map(c => c.metrics.ram)
        const diskVals = candidates.map(c => c.metrics.disk)
        const netVals = candidates.map(c => c.metrics.net)

        const cpuNorm = this.normalize(cpuVals)
        const ramNorm = this.normalize(ramVals)
        const diskNorm = this.normalize(diskVals)
        const netNorm = this.normalize(netVals)

        const W = {
            cpu: 0.4,
            ram: 0.25,
            disk: 0.25,
            net: 0.2
        }

        const ranked = candidates.map((candidate, index) => ({
            node: candidate.node,
            score: W.cpu * cpuNorm[index] + W.ram * ramNorm[index] + W.disk * diskNorm[index] + W.net * netNorm[index]
        }))

        ranked.sort((a, b) => a.score - b.score)

        const replication = Number(process.env.REPLICATION_FACTOR) || 3
        return ranked.slice(0, replication).map(item => item.node)
    }

    async getFile(req, res){
        const id = req.params.id

        if(!id) return res.status(400).json({ status: 'error', message: 'Missing file id', code: 102 })

        const fileRecord = await prisma.File.findFirst({
            where: { id },
            include: { locations: { include: { nodes: true } } }
        })

        if(!fileRecord) return res.status(404).json({ status: 'error', message: 'File not found', code: 103 })

        const locations = fileRecord.locations || []
        if(locations.length === 0) return res.status(404).json({ status: 'error', message: 'No locations for this file', code: 104 })

        for (const loc of locations) {
            try {
                const node = loc.nodes
                if(!node) continue

                const ip = node.current_ip || node.currentIp || node.ip
                const port = node.port || 80
                if(!ip) continue

                const url = `http://${ip}:${port}/files/${encodeURIComponent(fileRecord.storage_name)}`
                const resp = await axios.get(url, { responseType: 'stream', timeout: 8000 })

                if(resp.status === 200 && resp.data) {
                    if(resp.headers['content-type']) res.setHeader('Content-Type', resp.headers['content-type'])
                    if(resp.headers['content-length']) res.setHeader('Content-Length', resp.headers['content-length'])
                    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.display_name || fileRecord.storage_name}"`)

                    resp.data.pipe(res)

                    return await new Promise((resolve, reject) => {
                        resp.data.on('end', () => resolve())
                        resp.data.on('error', err => reject(err))
                    })
                }
            } catch (err) {
                console.warn(`getFile: node ${loc.nodes_id || ''} failed: ${err.message || err}`)
                continue
            }
        }

        return res.status(502).json({ status: 'error', message: 'No available node could serve the file', code: 105 })
    }

    async getFolder(req){
        const folderId = req.params.id

        if(!folderId) {
            return { status: 'error', message: 'Missing folder id', code: 106 }
        }

        const folder = await prisma.Folder.findFirst({
            where: { id: folderId },
            include: {
                files: true,
                subfolders: true
            }
        })

        if(!folder) {
            return { status: 'error', message: 'Folder not found', code: 107 }
        }

        return {
            status: 'ok',
            folder: {
                id: folder.id,
                display_name: folder.display_name,
                parent_id: folder.parent_id,
                createdAt: folder.createdAt,
                updatedAt: folder.updatedAt,
                files: folder.files.map(file => ({
                    id: file.id,
                    display_name: file.display_name,
                    storage_name: file.storage_name,
                    size: file.size,
                    folder_id: file.folder_id,
                    created: file.created
                })),
                subfolders: folder.subfolders.map(child => ({
                    id: child.id,
                    display_name: child.display_name,
                    parent_id: child.parent_id,
                    createdAt: child.createdAt,
                    updatedAt: child.updatedAt
                }))
            }
        }
    }
}

export default fileServices