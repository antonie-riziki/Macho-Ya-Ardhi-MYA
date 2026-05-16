import { ExtractionResult } from "./gemini_service";
import { GazetteRecord } from "./gazette_service";

export interface RiskReportResult {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  findings: string[];
  recommendations: string[];
}

export function computeRiskScore(
  documentsData: ExtractionResult[],
  gazetteMatches: GazetteRecord[],
  userInput: { buyer_name?: string, seller_name?: string, parcel_number?: string }
): RiskReportResult {
  let score = 0;
  let findings: string[] = [];
  let recommendations: string[] = [];

  // Mismatches cross documents
  const parcelNumbers = new Set<string>();
  const owners = new Set<string>();
  let hasMissingStamp = false;
  let hasMissingSignature = false;
  let hasSuspiciousEdits = false;
  let minConfidence = 100;

  documentsData.forEach(doc => {
    if (doc.parcel_number) parcelNumbers.add(doc.parcel_number.toLowerCase());
    if (doc.registered_owner) owners.add(doc.registered_owner.toLowerCase());
    
    if (doc.stamp_present === false) hasMissingStamp = true;
    if (doc.signature_present === false) hasMissingSignature = true;
    if (doc.suspicious_edits) hasSuspiciousEdits = true;
    if (doc.confidence < minConfidence) minConfidence = doc.confidence;
  });

  if (documentsData.length === 0) {
    return {
      score: 100,
      level: "HIGH",
      findings: ["No documents analyzed"],
      recommendations: ["Upload valid land documents"]
    }
  }

  // Cross check user input vs docs
  if (userInput.parcel_number && documentsData.length > 0) {
      if (!Array.from(parcelNumbers).some(p => p.includes(userInput.parcel_number!.toLowerCase()))) {
          score += 40;
          findings.push("Parcel number mismatch: Uploaded documents do not match provided parcel number.");
          recommendations.push("Verify you uploaded the correct documents for this parcel.");
      }
  } else if (parcelNumbers.size > 1) {
    score += 40;
    findings.push("Parcel mismatch: Documents contain conflicting parcel numbers.");
    recommendations.push("Manually verify the parcel number attached to all documents.");
  }
  
  // Notice we use a basic string similarity or just exact check for the demo
  if (userInput.seller_name && documentsData.length > 0) {
    if (!Array.from(owners).some(o => o.includes(userInput.seller_name!.toLowerCase()))) {
        score += 30;
        findings.push("Owner mismatch: The stated seller name does not match the registered owner.");
        recommendations.push("Conduct a fresh official search at the Lands Registry to confirm current ownership.");
    }
  } else if (owners.size > 1) {
    score += 30;
    findings.push("Owner mismatch: Documents contain conflicting registered owner names.");
    recommendations.push("Obtain a recent CR12 (for companies) or ID copy and cross-check ownership.");
  }

  if (hasMissingStamp) {
    score += 20;
    findings.push("Missing official stamp: One or more documents lack an official registry stamp.");
    recommendations.push("Ensure all official land searches and titles are newly stamped by the relevant registry.");
  }

  if (hasMissingSignature) {
    score += 15;
    findings.push("Missing signature: Missing key signatures on documents.");
    recommendations.push("Review documents for missing execution by registrar or transacting parties.");
  }

  if (hasSuspiciousEdits) {
    score += 35;
    findings.push("Suspicious edits detected: The AI flagged potential tampering, incorrect fonts, or altered dates.");
    recommendations.push("Request the original physical documents and verify their authenticity. Do NOT proceed with payment.");
  }

  if (gazetteMatches.length > 0) {
    score += 50;
    findings.push(`Gazette dispute found: Found ${gazetteMatches.length} matching notice(s) in the Kenya Gazette.`);
    recommendations.push("Consult a conveyancing lawyer immediately. This parcel is highly contested.");
  }

  if (minConfidence < 50) {
    score += 10;
    findings.push(`Low AI confidence (${minConfidence}%): The provided documents might be blurry or hard to read.`);
    recommendations.push("Re-upload clearer, high-resolution scans of the documents.");
  }

  if (parcelNumbers.size === 0) {
      score += 25;
      findings.push("Missing parcel number: Could not confidently extract a land parcel number from the documents.");
      recommendations.push("Ensure the title deed or search document clearly displays the parcel number.");
  }

  let level: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (score >= 51) level = "HIGH";
  else if (score >= 21) level = "MEDIUM";

  if (score === 0) {
     findings.push("No obvious inconsistencies found based on automated checks.");
     recommendations.push("Proceed with standard due diligence and lawyer consultation.");
  }

  return {
    score,
    level,
    findings,
    recommendations
  };
}
