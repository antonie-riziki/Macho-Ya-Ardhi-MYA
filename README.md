# Macho Ya Ardhi — Land Transaction Risk Agent

AI-powered land transaction verification platform that detects fraud risks by analyzing title deeds, parcel records, and gazette notices before land purchases in Kenya.

## Features

1. **Document Upload and Vision Extraction**: Upload land transaction documents (images, PDF scans) and use Gemini Vision to parse fields like parcel number, owner, registry, stamps, signatures, and signs of tampering.
2. **Cross-Document Consistency Checks**: Ensures that seller names match owners and parcel numbers are constant across multiple forms.
3. **Kenya Gazette Search**: Fuzzy searches against historic (mock) disputed and flagged plots.
4. **Risk Scoring Engine**: Dynamically calculates a risk priority level (Low/Medium/High).

## Requirements & Environment Variables

This demo uses a Full-Stack React + Express architecture. Ensure you have the following environment variables configured:

- `GEMINI_API_KEY`: Required to process documents and extract data.
- `APP_URL`: Your hosted URL if applicable.
- `GOOGLE_CLOUD_PROJECT`, `GOOGLE_APPLICATION_CREDENTIALS`: Optional for advanced integrations.

Configure these via the `Settings > Secrets` panel in AI Studio.

## Quickstart (Local Development)

If running outside the AI Studio environment on your own machine:

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Build for production:**
   \`\`\`bash
   npm run build
   npm run start
   \`\`\`

*(Note: There are no database migrations needed for this demo MVP as it uses mock Gazette tracking in-memory for immediate demonstration).*

## Demo Flow

1. Upload dummy title deed photos (images).
2. Enter an expected parcel number to test Gazette lookup. Try one of the test datasets below.
3. Click "Run Verification Agent".
4. Review the AI-generated risk assessment report.

### Sample Parcel Numbers to Test (Mock Gazette Matches)

- \`KJD/Kaputiei/1234\` (Simulates overlapping titles reported in Gazette)
- \`Nairobi/Block/82/733\` (Simulates active court dispute ELC No 123)
- \`LR/209/2489\` (Simulates caveat for pending succession matter)

## Limitations & Fallback Behavior

- Files are processed entirely in-memory and not stored persistently, ensuring privacy.
- If the Gemini API fails or runs out of quota, it falls back to a "Demo Extraction" mock, allowing the rest of the risk assessment engine to function and ensuring a smooth demo experience.
