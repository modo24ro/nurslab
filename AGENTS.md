# NursLab — Reguli pentru Agent (`AGENTS.md`)

## 1. Git Workflow (Obligatoriu după fiecare comandă)
După finalizarea și verificarea oricărei modificări de cod cerute de utilizator:
1. Verifică modificările (`git status` / build sau teste relevante, de ex. `npm run build` pentru frontend).
2. Rulează întotdeauna:
   ```bash
   git add -A
   git commit -m "<mesaj clar și descriptiv>"
   git push
   ```
3. Nu lăsa modificări necomise sau neîmpinse pe remote (`origin/main`) la finalul unei sarcini.

## 2. Configurație Docker & Porturi Server
Serverul găzduiește și alte proiecte, deci păstrează mapările de porturi ale acestui proiect:
- **PostgreSQL**: host `5433` → container `5432` (comunicarea internă Docker rămâne `postgres:5432`)
- **Redis**: host `6380` → container `6379` (comunicarea internă Docker rămâne `redis:6379`)
- **Backend API**: host `8000` → container `8000`
- **Frontend Web**: host `3000` → container `80`

## 3. UI & Responsivitate (`/admin/`)
- Panoul `/admin/` trebuie să rămână complet responsive pe telefoane și dispozitive pliabile (inclusiv Galaxy Z Fold 6 ecran interior):
  - Sub `lg` (`< 1024px`), meniul de navigare rămâne fix la baza ecranului (bottom bar).
  - Pe desktop (`>= 1024px`), sidebar-ul rămâne în partea stângă.
  - Tabelele se înfășoară în `overflow-x-auto` cu `min-w-[...]` adecvat, iar notificările Toast nu trebuie să se suprapună peste bara de jos.
