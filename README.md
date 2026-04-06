# Distributed File Storage System (DFSS)
## GATEWAY
Projekt systemu bazy plików w architektórze rozproszonej. 

Moduł gateway jest mostem między użytkownikiem a poszczególnym nodem

---
### Files Routes
- `/files/:id` (**GET**) - Znajduje i zwraca plik (id)
- `/files` (**POST**) - Wysyła pliki i je zapisuje w systemie
- `/folder/:id` (**GET**) - Znajduje i zwraca wszystkie pliki i podfoldery z folderu (id)


### Node Routes
- `/nodes` (**GET**) - Zwraca liste podłączonych nodów do zapisu wraz z ich stanem
- `/nodes/:id` (**GET**) - Zwraca stan podłączonego noda (id)