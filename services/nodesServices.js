import { prisma } from '../lib/prisma.ts'

class nodesServices{
    async nodeList(req, res){
        return null;
    }

    // Register or update a node in Postgres using Prisma. Expects fields in `req.body`.
    async registerNode(req, res){
        const src = req && req.body ? req.body : req || {}
        const { current_ip, hardware_id, name, total_space, created_at, last_connection, port } = src

        // try to find existing by hardware_id
        let node = await prisma.Nodes.findFirst({ where: { hardware_id } })

        const data = {
            hardware_id: hardware_id || undefined,
            current_ip: current_ip || undefined,
            name: name || undefined,
            total_space: typeof total_space !== 'undefined' && total_space !== null ? BigInt(total_space) : undefined,
            port: typeof port !== 'undefined' ? Number(port) : undefined,
            last_connect: last_connection ? new Date(last_connection) : undefined,
            created_at: created_at ? new Date(created_at) : undefined
        }

        if(node){
            node = await prisma.Nodes.update({ where: { id: node.id }, data })
        } else {
            node = prisma.Nodes.create({ data })
        }

        return node
    }

    // Push historical node record into Postgres (Node_History). Expects fields in `req.body`.
    async nodeHistoryPush(req){
        const src = req && req.body ? req.body : req || {}
        const { id: hardware_id, ip_address, status, name, total_space, used_space, ram_used, cpu_used, recorded_at, ram_total, connect_from } = src

        // find node by hardware_id; if not found, create placeholder
        let node = null
        if(hardware_id){
            node = await prisma.Nodes.findFirst({ where: { hardware_id } })
        }

        if(!node){
            node = await prisma.Nodes.create({ data: {
                hardware_id: hardware_id || undefined,
                current_ip: ip_address || undefined,
                name: name || undefined
            }})
        }

        const record = await prisma.node_History.create({ data: {
            current_ip: ip_address || node.current_ip || '',
            node_id: node.id,
            status: status || undefined,
            name: name || undefined,
            total_space: typeof total_space !== 'undefined' && total_space !== null ? BigInt(total_space) : undefined,
            used_space: typeof used_space !== 'undefined' && used_space !== null ? BigInt(used_space) : undefined,
            cpu_used: typeof cpu_used !== 'undefined' ? Number(cpu_used) : undefined,
            ram_used: typeof ram_used !== 'undefined' && ram_used !== null ? BigInt(ram_used) : undefined,
            ram_total: typeof ram_total !== 'undefined' && ram_total !== null ? BigInt(ram_total) : undefined,
            connect_from: connect_from ? new Date(connect_from) : undefined,
            recorced_at: recorded_at ? new Date(recorded_at) : undefined
        }})

        return record
    }
}

export default nodesServices