import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { extractDocumentData } from "./services/gemini_service";
import { computeRiskScore } from "./services/risk_engine";
import { searchGazette } from "./services/gazette_service";
import { generateReport } from "./services/report_service";

// Use memory storage for fast processing without saving locally
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Primary Endpoint: Verify Land
  app.post("/api/verify-land", upload.array("documents", 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const userInput = req.body; // { buyer_name, seller_name, parcel_number, county }
      
      if (!files || files.length === 0) {
         res.status(400).json({ error: "No documents uploaded." });
         return;
      }

      console.log(`Processing ${files.length} files...`);

      // 1. Process files through Gemini Vision parallel
      const extractionPromises = files.map(file => 
        extractDocumentData(file.buffer, file.mimetype)
      );
      const extractedDocs = await Promise.all(extractionPromises);

      // 2. Cross-Document Consistency & Finding parcel numbers
      let primaryParcelNumber = userInput.parcel_number || "";
      if (!primaryParcelNumber && extractedDocs.length > 0) {
        const docWithParcel = extractedDocs.find(d => d.parcel_number);
        if (docWithParcel) {
          primaryParcelNumber = docWithParcel.parcel_number;
        }
      }

      // 3. Search Mock Gazette
      let gazetteMatches: any[] = [];
      if (primaryParcelNumber) {
        gazetteMatches = await searchGazette(primaryParcelNumber);
      }

      // 4. Compute Risk
      const riskResult = computeRiskScore(extractedDocs, gazetteMatches, userInput);

      // 5. Generate Report
      const report = generateReport(extractedDocs, gazetteMatches, riskResult, userInput);

      res.status(200).json(report);
    } catch (error) {
      console.error("Error processing transaction:", error);
      res.status(500).json({ error: "Internal Server Error during verification." });
    }
  });

  // Simple Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development (React Frontend)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
