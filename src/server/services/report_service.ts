import { ExtractionResult } from "./gemini_service";
import { GazetteRecord } from "./gazette_service";
import { RiskReportResult } from "./risk_engine";

export interface FinalReport {
  report_id: string;
  transaction_summary: any;
  extracted_documents: ExtractionResult[];
  gazette_matches: GazetteRecord[];
  risk_score: number;
  risk_level: string;
  inconsistencies: string[];
  recommendations: string[];
  markdown_report: string;
}

export function generateReport(
  extractedDocs: ExtractionResult[],
  gazetteMatches: GazetteRecord[],
  riskResult: RiskReportResult,
  userInput: any
): FinalReport {
  
  const report_id = `MYA-${Date.now().toString(36).toUpperCase()}`;

  const mdReport = `
# Macho Ya Ardhi Risk Report
**Report ID:** ${report_id}
**Date:** ${new Date().toISOString()}

## Risk Assessment
**Level:** ${riskResult.level}
**Score:** ${riskResult.score} / 100

### Findings
${riskResult.findings.map(f => `- ${f}`).join('\n')}

### Recommendations
${riskResult.recommendations.map(r => `- ${r}`).join('\n')}

## Extracted Documents Summary
${extractedDocs.map((doc, idx) => `
**Document #${idx + 1} (${doc.document_type || 'Unknown'})**
- Parcel: ${doc.parcel_number || 'N/A'}
- Owner: ${doc.registered_owner || 'N/A'}
- Seller: ${doc.seller_name || 'N/A'}
- Registry: ${doc.registry || 'N/A'}
- Suspicious Edits: ${doc.suspicious_edits ? 'YES' : 'NO'}
`).join('\n')}

## Kenya Gazette Lookup
${gazetteMatches.length > 0 
  ? gazetteMatches.map(g => `- **${g.parcel_number}**: ${g.issue} (${g.source})`).join('\n') 
  : "No disputes found in Gazette mock database."}

---
*Disclaimer: This is an AI-generated risk assessment and does not constitute legal advice. Always consult a certified conveyancing lawyer in Kenya.*
  `;

  return {
    report_id,
    transaction_summary: userInput,
    extracted_documents: extractedDocs,
    gazette_matches: gazetteMatches,
    risk_score: riskResult.score,
    risk_level: riskResult.level,
    inconsistencies: riskResult.findings,
    recommendations: riskResult.recommendations,
    markdown_report: mdReport
  };
}
