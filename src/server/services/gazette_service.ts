import fs from 'fs';
import path from 'path';

export interface GazetteRecord {
  parcel_number: string;
  county: string;
  issue: string;
  notice_date: string;
  source: string;
  severity: string;
}

export async function searchGazette(parcelNumber: string): Promise<GazetteRecord[]> {
  try {
    const mockDataPath = path.join(process.cwd(), 'src/server/mock/gazette_mock.json');
    const data = fs.readFileSync(mockDataPath, 'utf8');
    const records: GazetteRecord[] = JSON.parse(data);

    // Filter fuzzily or exact matches
    return records.filter(record => {
      // Very simple fuzzy match check
      if (!parcelNumber) return false;
      const lowerParcel = parcelNumber.toLowerCase();
      return record.parcel_number.toLowerCase().includes(lowerParcel);
    });
  } catch (error) {
    console.error("Error reading gazette mock DB", error);
    return [];
  }
}
