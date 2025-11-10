# digital-renewal-permis-auto

Aplicație web modernă pentru trimiterea online a cererilor de reînnoire a permisului auto.  
Construite cu **React (frontend)**, **Express/Node.js (backend)** și **MongoDB Atlas (bază de date)**.

Include:
- Formular complet React
- Generare PDF automat la trimiterea cererii
- Salvare în MongoDB Atlas
- API REST pentru vizualizarea cererilor
- UI modern, centrat, responsiv

---

## 📦 Tehnologii folosite

### **Frontend**
- React (Create React App)
- CSS modern
- Fetch API

### **Backend**
- Node.js & Express
- XML parsing
- PDFKit (generare PDF)
- Mongoose

### **Database**
- MongoDB Atlas  
- Conexiune securizată prin `.env`

---

## 📁 Structura proiectului
egov-permis-auto-react/
├── server.js # Backend Node + Express
├── .env # Variabile pentru MongoDB Atlas
├── client/ # Frontend React
│ ├── src/
│ │ ├── App.js
│ │ ├── App.css
│ │ └── index.js
│ └── package.json
└── package.json # Backend dependencies

## 🔧 Instalare

### 1️⃣ Clonează proiectul

```bash
git clone https://github.com/<username>/egov-permis-auto-react.git
cd egov-permis-auto-react

2️⃣ Instalează backend-ul
npm install

3️⃣ Creează fișierul .env
MONGO_URI=your-mongodb-atlas-uri-here
PORT=3000

4️⃣ Instalează frontend-ul
cd client
npm install

▶️ Rulare proiect
📌 Rulează backend-ul
cd ..
node server.js

Backendul rulează pe:
http://localhost:3000

📌 Rulează frontend-ul React
cd client
npm start

Frontend automat rulează pe:
http://localhost:3001

Datorită setării de proxy din client/package.json:

"proxy": "http://localhost:3000"
