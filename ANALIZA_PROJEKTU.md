# 📋 ANALIZA PROJEKTU: Dropbox-Gateway (DFSS)

**Data analizy**: 15 kwietnia 2026  
**Projekt**: Distributed File Storage System - Moduł Gateway  
**Technologia**: Node.js/Express, PostgreSQL (Prisma), Redis, SSE

---

## 🔴 KRYTYCZNE - BRAKUJĄCE FUNKCJONALNOŚCI (MUSI BYĆ)

### 1. **Weryfikacja Użytkownika (Security Critical)**
- **Gdzie**: Controllers (`filesController.js`, `nodesController.js`)
- **Problem**: Wszędzie jest komentarz `TODO: ADD USER VERIFICATION` - żadne endpointy nie weryfikują tożsamości użytkownika
- **Wpływ**: KRYTYCZNY - system jest całkowicie niezabezpieczony
- **Do zrobienia**:
  - Implementacja middleware'u autentykacji
  - Weryfikacja JWT tokenów
  - Sprawdzenie uprawnień do zasobów (czy użytkownik ma dostęp do konkretnego pliku/folderu)
  - Walidacja tokena w `Tokener` modelu (magicAuth, passRes)

### 2. **Complete File Upload Logic** (fileServices.js)
- **Gdzie**: `services/fileServices.js`
- **Problem**: 
  - Metoda `postFiles()` jest niekompletna - nie kończy się poprawnie
  - Brakuje zwrócenia wyniku (brak `return`)
  - `findAviableNodes()` jest zdefiniowana ale pusta
  - Nie obsługuje errory dla węzłów
- **Do zrobienia**:
  - Implementacja logiki wyboru dostępnych nodów
  - Obsługa sytuacji gdy plik się nie wrzuci na żaden node
  - Proper error handling
  - Zwrócenie informacji o statusie upload'u

### 3. **Download File Implementation** (getFile)
- **Gdzie**: `controllers/filesController.js`, `services/fileServices.js`
- **Problem**: Metoda `getFile()` w services jest zupełnie pusta
- **Do zrobienia**:
  - Znalezienie pliku w DB (File model)
  - Pobranie lokalizacji z FileLocation
  - Pobranie pliku z wybranego node'a
  - Obsługa sytuacji gdy plik jest na wielu nodes
  - Streaming pliku do klienta

### 4. **Get Folder Contents** (getFolder)
- **Gdzie**: `controllers/filesController.js`, `services/fileServices.js`  
- **Problem**: Metoda `getFolder()` w services jest zupełnie pusta
- **Do zrobienia**:
  - Znalezienie folderu w DB
  - Pobranie listy plików w folderze
  - Pobranie listy podfolderów
  - Zwrócenie metadanych (rozmiar, data, węzły)

### 5. **Node Autoconnection System**
- **Gdzie**: `services/nodesServices.js`, `services/lisenHeartbeat.js`
- **Problem**: TODO w README mówi "Try autoconnect to saved nodes by SQL list" - nie ma implementacji przy starcie
- **Do zrobienia**:
  - Przy starcie Gateway'a, wczytać wszystkie approved nodes z DB
  - Automatycznie się do nich połączyć (SSE)
  - Obsłużyć reconnect gdy node się odpali

### 6. **Error Handling & Consistency**
- **Problem**: 
  - Kod błędu `100` jest używany wszędzie, brak specyficznych kodów
  - Brakuje strukturalnego handleowania błędów
  - Niekonsystentne response'y (czasem `.json()`, czasem `.send()`)
- **Do zrobienia**:
  - Stworzyć custom Error class
  - Zdefiniować spójny system kodów błędów (jak w komentarzu w index.js)
  - Global error middleware
  - Konsystentny format response'ów

### 7. **Request Body Parsing Issues**
- **Gdzie**: `controllers/filesController.js` (getFile, getFolder)
- **Problem**: 
  - Metody nie wyciągają ID z `req.params`, tylko szukają w `req`
  - `getFile()` i `getFolder()` mają identyczną implementację ale powinny być różne
- **Do zrobienia**:
  - Poprawić ekstrakcję ID z URL params
  - Dodać walidację parametrów

---

## 🟠 WAŻNE - RZECZY DO POPRAWKI (POWINNA BYĆ)

### 8. **Multer Configuration**
- **Gdzie**: `routes/filesAPI.js`
- **Problem**: 
  - Multer ustawiony na `memoryStorage()` - może zapaść dla dużych plików
  - Brak limitu rozmiaru pliku
  - Brak validacji mimetype
- **Do zrobienia**:
  - Dodać limit rozmiaru (`fileSize: 5GB`)
  - Filtrować mime types
  - Rozważyć disk storage zamiast memory dla dużych plików

### 9. **Node Selection Algorithm**
- **Gdzie**: `findAviableNodes()` (pusta funkcja w fileServices)
- **Problem**: Brakuje logiki do wyboru którym nodes wysłać plik
- **Do zrobienia**:
  - Algorytm load-balancing (najdniej załadowany node)
  - Uwzględnianie redundancji (kilka kopii)
  - Sprawdzenie dostępnej przestrzeni
  - Uwzględnianie odległości geografi cznej (jeśli są nodes w różnych lokalizacjach)

### 10. **Database Transaction Cleanup**
- **Gdzie**: `fileServices.js` - `postFiles()`
- **Problem**: 
  - Transakcja `prisma.$transaction()` nie robi nic z wynikiem
  - Nie ma walidacji czy zostały stworzone FileLocation records
- **Do zrobienia**:
  - Poprawne użycie transaction result
  - Rollback gdy upload na nodes się nie powiedzie

### 11. **SSE Connection Management**
- **Gdzie**: `services/lisenHeartbeat.js`
- **Problem**: 
  - Brakuje czyszczenia stare'ch połączeń
  - Brak timeout'u jeśli node się nie odzywa
  - Brakuje heartbeat check'u
- **Do zrobienia**:
  - Implementacja timeout dla SSE
  - Ping/pong heartbeat
  - Automatic cleanup nieaktywnych connections

### 12. **Cron Jobs Not Running**
- **Gdzie**: `index.js`
- **Problem**: `runCron()` jest zakomentowana - nie uruchamia się
- **Do zrobienia**:
  - Odkomentować i przetestować
  - Dodać rzeczywiste job'i (np. cleanup, stats collection)

### 13. **Environment Variables**
- **Gdzie**: `package.json` devDependencies
- **Problem**: `.env` file nie jest wymieniony w README, brakuje `.env.example`
- **Do zrobienia**:
  - Stworzyć `.env.example`
  - Dokumentować wszystkie wymagane zmienne

### 14. **API Documentation**
- **Gdzie**: `README.md`
- **Problem**: 
  - Brakuje szczegółowej dokumentacji endpoint'ów
  - Brak response example'i
  - Brak informacji o authentication
- **Do zrobienia**:
  - Dodać OpenAPI/Swagger doc
  - Response example'i dla każdego endpoint'u

### 15. **Folder Operations Incomplete**
- **Problem**: 
  - POST endpoint do tworzenia folderów brakuje
  - DELETE endpoint brakuje
  - UPDATE endpoint brakuje
- **Do zrobienia**:
  - Dodać `POST /folder` - tworzenie folderu
  - Dodać `DELETE /folder/:id` - usuwanie folderu
  - Dodać `PUT /folder/:id` - zmiana nazwy
  - Dodać `DELETE /files/:id` - usuwanie pliku

### 16. **File Deletion from Nodes**
- **Problem**: Nie ma mechanizmu do usunięcia pliku ze wszystkich nodes
- **Do zrobienia**:
  - Implementacja logiki do usunięcia z każdego node'a
  - Transakcja w DB aby upewnić się że wszystko się usunęło

---

## 🟡 MILE WIDZIANE USPRAWNIENIA (NICE TO HAVE)

### 17. **Input Validation**
- **Gdzie**: Controllers
- **Sugestia**: 
  - Dodać `express-validator` lub `joi` do validacji request'ów
  - Walidować rozmiary, nazwy plików, path'y

### 18. **Logging System**
- **Sugestia**: 
  - Zamiast samych `console.log()` użyć `winston` lub `pino` logger'a
  - Dodać request logging (morgan)
  - Structured logging dla monitoring'u

### 19. **Monitoring & Metrics**
- **Sugestia**:
  - Dodać Prometheus metrics
  - Track upload/download speeds
  - Node health metrics
  - Space usage tracking

### 20. **Caching Strategy**
- **Sugestia**: 
  - Redis cache dla metadanych plików
  - Cache node list'y (aktualnie każdy request skanuje Redis)
  - Cache availability of nodes

### 21. **File Integrity Checking**
- **Sugestia**:
  - Dodać SHA256 hash do każdego pliku
  - Verify hash po upload/download
  - Detect corruption (model Node_History ma pole status `corrupted`)

### 22. **Better Code Structure**
- **Sugestia**:
  - Middleware architecture
  - Dependency injection
  - Separate layer dla DB operations
  - Constants file dla magic numbers

### 23. **Tests**
- **Status**: Brak testów
- **Sugestia**:
  - Unit testy dla services
  - Integration testy dla endpoints
  - Load testy dla upload/download

### 24. **Rate Limiting Customization**
- **Sugestia**:
  - Różne limity dla upload vs download
  - Limity na user (nie na globalny IP)
  - Limity na node

### 25. **Replication Strategy**
- **Sugestia**:
  - Dla ważnych plików - replikacja na 3+ nodes
  - Configurable redundancy level
  - Automatic replication check

### 26. **API Versioning**
- **Sugestja**: Dodać `/v1` prefix do API endpoint'ów dla przyszłej kompatybilności

### 27. **Database Optimization**
- **Sugestja**:
  - Indeksy na Folder `user_id`
  - Indeksy na File dla szybszego wyszukiwania
  - Batch queries zamiast loop'ów

### 28. **Session Management**
- **Model exists**: `Session` model istnieje ale nie jest używany
- **Sugestja**: Zintegować session management z login flow

### 29. **Node Status Dashboard**
- **Sugestja**: Endpoint `/dashboard` pokazujący realtime status wszystkich nodes

### 30. **Compression**
- **Sugestia**: Gzip compression dla API response'ów, compression plików w upload

---

## 📊 PODSUMOWANIE STATUS'U

| Kategoria | Status | % |
|-----------|--------|---|
| Core Functionality | 🔴 Niekompletna | 30% |
| Security | 🔴 Brakuje | 0% |
| Error Handling | 🟠 Słabe | 20% |
| Documentation | 🟡 Minimalna | 15% |
| Tests | 🔴 Brakuje | 0% |
| Production Ready | 🔴 NIE | - |

---

## 🎯 PRIORITY CHECKLIST (Co zrobić najpierw)

### Faza 1: CRITICAL (Tydzień 1)
- [ ] Implementacja autentykacji (JWT middleware)
- [ ] Complete getFile() implementation
- [ ] Complete postFiles() implementation  
- [ ] Complete getFolder() implementation
- [ ] Global error handler

### Faza 2: IMPORTANT (Tydzień 2-3)
- [ ] Multer configuration (limits, validation)
- [ ] Node selection algorithm
- [ ] SSE connection improvements
- [ ] Auto-connect to saved nodes
- [ ] Add CRUD endpoints dla folderów

### Faza 3: NICE TO HAVE (Tydzień 4+)
- [ ] Input validation
- [ ] Logging system
- [ ] Basic tests
- [ ] API documentation
- [ ] File integrity checking

---

## 📝 NOTATKI DODATKOWE

### Potencjalne problemy:
1. **Wydajność**: Loop po nodes dla każdego pliku może być slow
2. **Scalability**: Redis scan() dla każdego request'u do `/nodes` - brakuje caching'u
3. **Reliability**: Brak retry logic dla failed uploads

### Architektura jest dobra:
- ✅ Separation of concerns (controllers, services)
- ✅ Database schema jest dobrze sprojektowany
- ✅ SSE implementation dla heartbeat'u

### Deployment notes:
- Wymagane ENV vars: `DATABASE_URL`, `REDIS_URL`, `PORT`
- Brakuje `.env.example`
- Brakuje setup instrukcji

---

**Wygenerowano automatycznie podczas analizy kodu**
