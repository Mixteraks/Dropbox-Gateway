# Distributed File Storage System (DFSS)
## GATEWAY
Projekt systemu bazy plików w architektórze rozproszonej. 

Moduł gateway jest mostem między użytkownikiem a poszczególnym nodem. 
Zapisuje on w db na jakim node został wysłany poszczególny plik.

---
### Files Routes
- `/files/:id` (**GET**) - Znajduje i zwraca plik (id)
- `/files` (**POST**) - Wysyła pliki i je zapisuje w systemie
- `/folder/:id` (**GET**) - Znajduje i zwraca wszystkie pliki i podfoldery z folderu (id)


### Node Routes
- `/nodes` (**GET**) - Zwraca liste podłączonych nodów do zapisu wraz z ich stanem
- `/nodes/:id` (**GET**) - Zwraca stan podłączonego noda (id)


# TODO
[] Node List (SSE)
[] Auto HistoryPush from Redis
[] Try autoconnect to saved nodes by SQL list
[] HistoryPush on Error

[] Working Files Operations
[] Multi Node Save?