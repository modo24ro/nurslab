# NursLab - Nursing Practice
### Enterprise-Grade Medical Learning & E-Learning Platform

NursLab este o platformă medicală completă de educație și e-learning pentru asistenți medicali, studenți, formatori și profesioniști din domeniul sănătății. Platforma combină teoria fundamentată clinic, demonstrațiile video detaliate, testele grilă de autoevaluare cu eliberare de certificate atestate și atelierele practice de instruire pe simulatoare medicale.

---

## 🏥 Caracteristici Principale

### 1. Pagină Publică Inspirată din Identitatea Vizuală NursLab
- **Logo Original Vectorial (SVG)**: Simbol cu inimă, traseu ECG și carte deschisă, alături de sloganul *„Învață. Exersează. Aplică.”*
- **Sistem de Design Medical**:
  - Alb cald (`#FBFBFA`) și accente marine (`#102B46`)
  - Verde medical (`#116448`) pentru butoane primare și elemente de acțiune
  - Badge-uri pastelate pentru diferențierea conținutului (*GRATUIT* cu verde mentă, *CU PLATĂ* cu piersică/coral, *LIVE* cu roșu)
  - Tipografie editorială cu serif (`Lora`) pentru titluri mari și sans-serif (`Plus Jakarta Sans`) pentru interfață.
- **Secțiuni Gestionabile dinamic din CMS**:
  1. *Hero* cu poză clinică autentică și bilet adeziv (*„Mai multă încredere în practica de zi cu zi. ❤️”*)
  2. *Alege cum începi* (Resurse gratuite, Cursuri online, Workshopuri fizice)
  3. *Parcursul tău NursLab* (1. Înțelegi teoria → 2. Vezi demonstrația → 3. Verifici ce ai învățat → 4. Exersezi la workshop)
  4. *Adu practica în orașul tău* (Selector oraș + selector temă + formular înregistrare listă de interes)
  5. *Îngrijiri la domiciliu* (Catalog servicii mobile + formular solicitare vizită asistent la domiciliu)
  6. *Abordarea holistică a îngrijirii* (Îngrijire fizică, psiho-emoțională, spirituală, socială)
  7. *Invitați NursLab* (Interviuri medici primari, webinarii live, discuții cu aparținători)
  8. *Lumea medicală* (Articole, ghiduri de carieră și inovație tehnologică în nursing)

### 2. Learning Management System (LMS)
- **Catalog Cursuri**: Filtrare după categorie, nivel de dificultate, gratuit/cu plată și căutare în timp real.
- **Sală de Curs Digitală**:
  - Player video responsiv cu reținere poziție și reluare playback.
  - Programa cursului integrată în bară laterală cu marcaj de progres.
  - Notițe personale legate de secundele videoclipului.
  - Teste grilă interactive cu feedback imediat și explicație medicală clinică.
- **Generare & Verificare Certificate**:
  - Generare automată de certificare PDF la promovarea testului (ReportLab).
  - Pagină publică de verificare criptografică după cod unic (`/certificate/verify/{code}`).

### 3. Monetizare & Facturare Fiscală (RO e-Factura Ready)
- Suport pentru cursuri gratuite și achiziții unice.
- Abonamente recurente (Lunar: 49 RON, Anual: 450 RON).
- Formular de facturare cu opțiune pentru Persoană Fizică sau Persoană Juridică (CUI, Nr. Reg. Comerțului, adresă sediu).
- Generare automată a facturilor fiscale cu serie `NLB` și număr secvențial, calcul de TVA 19% și descărcare istoric facturi din contul de student.

### 4. Panou Cuprinzător de Administrare (`/admin`)
- **Dashboard KPI**: Număr utilizatori, cursanți activi, înscrieri, venituri totale facturate în RON, cereri de workshop și solicitări de îngrijire.
- **Editor Conținut CMS**: Posibilitatea de a modifica orice text, titlu, imagine, badge sau link din pagina publică fără a modifica codul sursă.
- **Management Cursuri**: Publicare/ciornă cursuri, configurare prețuri și module.
- **Gestiune Lead-uri**: Status înscrieri workshopuri locale și comenzi de îngrijiri la domiciliu.
- **Management Utilizatori & RBAC**: Atribuire roluri (`student`, `instructor`, `admin`, `super_admin`).

---

## 🛠️ Arhitectură Tehnologică

```
NursLab/
├── frontend/               # React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query
├── backend/                # Python 3.12 + FastAPI + SQLAlchemy 2.0 (Async) + Pydantic v2
│   ├── app/
│   │   ├── api/v1/         # Rutere REST versionate (/auth, /courses, /cms, etc.)
│   │   ├── core/           # Config, Security (JWT/Bcrypt), Database, Celery
│   │   ├── models/         # Modele relaționale SQLAlchemy (User, Course, Quiz, Order, etc.)
│   │   ├── schemas/        # Scheme de validare Pydantic v2
│   │   └── services/       # Seed date clinice, PDF certificate ReportLab
├── docker-compose.yml      # Orchetrare servicii: PostgreSQL 16, Redis 7, Backend, Celery, Frontend
```

---

## 🚀 Pornire Rapidă cu Docker Compose

### 1. Lansare containere
```bash
docker compose up --build -d
```

### 2. Porturi Servicii
- **Frontend Web**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL**: Port 5432 (`nurslab_db`)
- **Redis**: Port 6379

### 3. Conturi Pre-configurate pentru Testare
| Rol | Email | Parolă | Acces |
|---|---|---|---|
| **Super Administrator** | `admin@nurslab.ro` | `Admin123!` | Acces complet `/admin` + CMS + Comenzi |
| **Formator Clinic** | `dr.elena@nurslab.ro` | `Instructor123!` | Management cursuri |
| **Student / Cursant** | `student@nurslab.ro` | `Student123!` | Acces cursuri, panou student |
