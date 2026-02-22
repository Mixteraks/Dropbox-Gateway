class nodesServices{
    async nodeList(){
        // Przepytanie DB w sprawie istniejących nodów i zwrócenie ich statusów (REDIS)
        // (id, ip_address, status, total_space, used_space, cpu_used, ram_used, overload_level, last_contact)

        return new Error("Funkcja zostanie wprowadzona")
    }

    async registerNode(){
        // Rejestracja nowego Noda do db (POSTGRES)
        // (ip_address, id, name, total_space, created_at, last_connection)
    }

    async nodeHistoryPush(){
        // Rejestracja danych historycznych Noda do db (POSTGRES)
        // (id, ip_address, status, name, total_space, used_space, ram_used, cpu_used, recorced_at)
        // Możliwa rejestracja podczas erroru noda 
    }
}

export default nodesServices