const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { parseStringPromise } = require('xml2js');
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Conectare MongoDB 
mongoose.connect(process.env.MONGO_URI, { dbName: 'egovPermis' })
  .then(() => console.log("Conectat la MongoDB Atlas"))
  .catch(err => console.error("Eroare MongoDB:", err));

// Schema MongoDB
const cerereSchema = new mongoose.Schema({
  nume: String,
  telefon: String,
  email: String,
  cnp: String,
  tipPermis: String,
  categorie: String,
  motivSolicitare: String,
  dataExaminarii: String,
  centruExaminare: String,
  taxa: Number,
  tva: Number,
  total: Number,
  dataTrimitere: { type: Date, default: Date.now },
  pdfFile: String,
  xmlRaw: String
});

const Cerere = mongoose.model('Cerere', cerereSchema);

// Folder PDF
const pdfFolder = path.join(__dirname, 'pdfs');
if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder);
app.use('/pdfs', express.static(pdfFolder));

// Endpoint formular
app.post('/submitForm', async (req, res) => {
  try {
    const { xml } = req.body;
    if (!xml) throw new Error("Lipsă XML!");

    const data = await parseStringPromise(xml, { explicitArray: false });
    const d = data.cererePermis;

    // Validare câmpuri necesare
    if (!d.nume || !d.telefon || !d.cnp || !d.email || !d.tipPermis || !d.categorie || !d.motivSolicitare) {
      throw new Error("Date incomplete!");
    }

    const pdfFileName = `ordin-${Date.now()}.pdf`;
    const pdfPath = path.join(pdfFolder, pdfFileName);

    // Generare PDF 
    await new Promise((resolve, reject) => {
      const pdf = new PDFDocument({ size: "A4", margin: 50 });
      const pdfStream = fs.createWriteStream(pdfPath);
      pdf.pipe(pdfStream);

      // Titlu
      pdf.fontSize(20)
        .fillColor("#23408e")
        .font("Helvetica-Bold")
        .text("ORDIN DE PLATA - PERMIS AUTO", { align: "center" })
        .moveDown(2);

      // Sectiune Date solicitant
      pdf.fontSize(12)
        .fillColor("black")
        .font("Helvetica-Bold")
        .text("Date solicitant", { underline: true })
        .moveDown(0.5);

      pdf.font("Helvetica")
        .text(`Nume solicitant: ${d.nume}`)
        .text(`Telefon: ${d.telefon}`)
        .text(`Email: ${d.email}`)
        .text(`CNP: ${d.cnp}`)
        .moveDown(1);

      // Secțiune Date permis
      pdf.font("Helvetica-Bold")
        .text("Date permis", { underline: true })
        .moveDown(0.5);

      pdf.font("Helvetica")
        .text(`Tip permis: ${d.tipPermis}`)
        .text(`Categorie: ${d.categorie}`)
        .text(`Motiv solicitare: ${d.motivSolicitare}`)
        .text(`Data examinarii: ${d.dataExaminarii || "—"}`)
        .text(`Centru examinare: ${d.centruExaminare || "—"}`)
        .moveDown(1);
        
      // Detalii plată tabel
      pdf
        .moveDown(1)
        .font("Helvetica-Bold")
        .text("Detalii plata", { underline: true })
        .moveDown(0.5);

      // Stil consistent cu secțiunea „Date permis”
      pdf
        .font("Helvetica")
        .fillColor("black")
        .text(`Taxa permis: ${d.taxa} RON`)
        .text(`TVA (21%): ${d.tva} RON`)
        .font("Helvetica-Bold")
        .text(`TOTAL DE PLATA: ${d.total} RON`)
        .moveDown(1);

      // Linie de separare estetică
      pdf
        .moveTo(50, pdf.y)
        .lineTo(550, pdf.y)
        .strokeColor("#cccccc")
        .lineWidth(0.5)
        .stroke()
        .moveDown(1);

      // Alte detalii administrative
      pdf
        .font("Helvetica")
        .fillColor("black")
        .text(`Data emiterii: ${new Date().toLocaleString()}`)

      pdf.end();
      pdfStream.on("finish", resolve);
      pdfStream.on("error", reject);
    });

    // Salvare în MongoDB
    const cerereNoua = new Cerere({
      nume: d.nume,
      telefon: d.telefon,
      email: d.email,
      cnp: d.cnp,
      tipPermis: d.tipPermis,
      categorie: d.categorie,
      motivSolicitare: d.motivSolicitare,
      dataExaminarii: d.dataExaminarii,
      centruExaminare: d.centruExaminare,
      taxa: Number(d.taxa),
      tva: Number(d.tva),
      total: Number(d.total),
      pdfFile: `/pdfs/${pdfFileName}`,
      xmlRaw: xml
    });

    await cerereNoua.save();
    console.log("Cerere salvată în MongoDB:", cerereNoua._id);

    res.json({ status: 'ok', pdfUrl: cerereNoua.pdfFile });

  } catch (err) {
    console.error("Eroare:", err);
    res.status(400).json({ status: 'error', error: err.message });
  }
});

// Endpoint pentru extragerea XML
app.get('/api/cereri/:id/xml', async (req, res) => {
  try {
    const cerere = await Cerere.findById(req.params.id);
    if (!cerere) return res.status(404).send('Cererea nu există');
    res.type('application/xml').send(cerere.xmlRaw);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la extragerea XML-ului.' });
  }
});

// --- Pornire server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server pornit pe http://localhost:${PORT}`));
