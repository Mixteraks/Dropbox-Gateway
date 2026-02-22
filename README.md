# Distributed File Storage System (DFSS)
## GATEWAY
Projekt systemu bazy plików w architektórze rozproszonej.

Moduł gateway jest mostem między użytkownikiem a poszczególnym nodem

### Files Routes
- `\getFile\:fileID` - Znajduje i zwraca plik(ID)
- `\getFolder\:folderID` - Znajduje i zwraca wszystkie pliki i foldery z folderu(ID) 
- `\postFile` - 