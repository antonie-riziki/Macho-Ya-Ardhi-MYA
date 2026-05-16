/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, FormEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Send, FileCheck2, FileSearch2, X, FileUp, ShieldCheck, FileWarning, Search, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';
import ReactMarkdown from 'react-markdown';

interface ExtractionResult {
  parcel_number: string | null;
  registered_owner: string | null;
  seller_name: string | null;
  id_number: string | null;
  document_type: string | null;
  issue_date: string | null;
  registry: string | null;
  stamp_present: boolean;
  signature_present: boolean;
  suspicious_edits: boolean;
  confidence: number;
}

interface GazetteRecord {
  parcel_number: string;
  county: string;
  issue: string;
  notice_date: string;
  source: string;
  severity: string;
}

interface FinalReport {
  report_id: string;
  transaction_summary: any;
  extracted_documents: ExtractionResult[];
  gazette_matches: GazetteRecord[];
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  inconsistencies: string[];
  recommendations: string[];
  markdown_report: string;
}

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [sellerName, setSellerName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [parcelNumber, setParcelNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedForms = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedForms]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please upload at least one document.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });
    
    formData.append('seller_name', sellerName);
    formData.append('buyer_name', buyerName);
    formData.append('parcel_number', parcelNumber);

    try {
      const res = await fetch('/api/verify-land', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to analyze documents");
      }

      const data = await res.json() as FinalReport;
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-rose-200">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-rose-600" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">Macho Ya Ardhi</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">AI LAND FRAUD DETECTION DETECTIVE</p>
          </div>
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Agent Active
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Col: Upload Form */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Stress-Test Your Transaction</h2>
            <p className="text-gray-500 text-sm">Upload title deeds, search certificates, and transfer forms. Our AI cross-checks details across documents and the Kenya Gazette database to identify fraud indicators before you buy.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:bg-gray-50 cursor-pointer",
                files.length > 0 ? "border-rose-300" : "border-gray-300"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                multiple 
                accept="image/*,application/pdf"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-full">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Click to upload documents</p>
                  <p className="text-xs text-gray-500 mt-1">Accepts images and PDFs</p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Attached Documents</h3>
                <ul className="space-y-2">
                  {files.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-xs font-medium text-gray-600 truncate max-w-[200px]">{file.name}</span>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Parcel Number (Optional)</label>
                <input 
                  type="text" 
                  value={parcelNumber}
                  onChange={e => setParcelNumber(e.target.value)}
                  placeholder="e.g. KJD/Kaputiei/1234"
                  className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Seller Name (Optional)</label>
                <input 
                  type="text" 
                  value={sellerName}
                  onChange={e => setSellerName(e.target.value)}
                  placeholder="Name of individual or company"
                  className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || files.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                 <span className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                   Analyzing...
                 </span>
              ) : (
                <>
                  Run Verification Agent <Search className="w-4 h-4" />
                </>
              )}
            </button>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </p>
            )}
          </form>

          {/* Helper Panel */}
          <div className="bg-gray-100 rounded-xl p-5 text-sm text-gray-600 space-y-3">
            <p className="font-semibold text-gray-800">For the demo, try parcel numbers:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>KJD/Kaputiei/1234</li>
              <li>Nairobi/Block/82/733</li>
            </ul>
          </div>
        </div>

        {/* Right Col: Results */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!report && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl p-8"
              >
                <FileSearch2 className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">Awaiting Submissions</p>
                <p className="text-sm text-center max-w-sm mt-2">Upload land transaction documents to generate an instant fraud risk assessment report.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative">
                  <ShieldAlert className="w-16 h-16 text-rose-200 animate-pulse" />
                  <Search className="w-8 h-8 text-rose-600 absolute bottom-0 right-0 animate-bounce" />
                </div>
                <p className="text-rose-600 font-medium">Agent extracting & cross-referencing...</p>
              </motion.div>
            )}

            {report && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                {/* Score Card */}
                <div className={cn(
                  "p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6",
                  report.risk_level === 'HIGH' ? "bg-red-50 border-red-200" :
                  report.risk_level === 'MEDIUM' ? "bg-amber-50 border-amber-200" :
                  "bg-emerald-50 border-emerald-200"
                )}>
                  <div className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-sm border-4",
                    report.risk_level === 'HIGH' ? "bg-white text-red-600 border-red-500" :
                    report.risk_level === 'MEDIUM' ? "bg-white text-amber-600 border-amber-500" :
                    "bg-white text-emerald-600 border-emerald-500"
                  )}>
                    {report.risk_score}
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-xl font-bold",
                      report.risk_level === 'HIGH' ? "text-red-800" :
                      report.risk_level === 'MEDIUM' ? "text-amber-800" :
                      "text-emerald-800"
                    )}>
                      {report.risk_level} RISK DETECTED
                    </h3>
                    <p className="text-gray-700 mt-1">
                      {report.risk_level === 'HIGH' && "Critical red flags identified. Do not proceed without extreme caution and independent legal representation."}
                      {report.risk_level === 'MEDIUM' && "Potential inconsistencies found. Further clarification and physical registry searches required."}
                      {report.risk_level === 'LOW' && "No obvious surface-level inconsistencies found. Proceed with standard due diligence."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Findings */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                      <FileWarning className="w-5 h-5 text-amber-500" />
                      Inconsistencies
                    </h4>
                    {report.inconsistencies.length > 0 ? (
                      <ul className="space-y-3">
                        {report.inconsistencies.map((inc, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-600 items-start">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">None detected.</p>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      Recommendations
                    </h4>
                    <ul className="space-y-3">
                      {report.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-600 items-start">
                          <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Extracted Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                  <h4 className="font-semibold flex items-center gap-2 text-gray-900 border-b pb-4">
                    <FileCheck2 className="w-5 h-5 text-blue-500" />
                    Extraction Details
                  </h4>
                  
                  {report.extracted_documents.map((doc, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 text-sm grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100">
                      <div className="col-span-full">
                        <span className="font-bold text-gray-900 bg-white border px-2 py-1 rounded text-xs">Doc #{idx + 1} - {doc.document_type || "Unknown Type"}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 font-medium">Parcel Number</span>
                        <span className="text-gray-900 font-mono">{doc.parcel_number || "---"}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 font-medium">Owner</span>
                        <span className="text-gray-900 font-medium">{doc.registered_owner || "---"}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 font-medium">Registry</span>
                        <span className="text-gray-900">{doc.registry || "---"}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 font-medium">Status</span>
                        <div className="flex gap-2 mt-1">
                          {doc.stamp_present ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Stamped</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">No Stamp</span>
                          )}
                           {doc.signature_present ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Signed</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">No Signature</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {report.gazette_matches.length > 0 && (
                    <div className="mt-6 border-t pt-6">
                       <h5 className="font-semibold flex items-center gap-2 text-rose-700 mb-4">
                        Kenya Gazette Hits Found
                      </h5>
                      <div className="space-y-4">
                        {report.gazette_matches.map((match, idx) => (
                          <div key={idx} className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                            <p className="font-mono text-sm font-bold text-rose-800">{match.parcel_number}</p>
                            <p className="text-sm mt-1 text-gray-800">{match.issue}</p>
                            <div className="flex gap-4 mt-2 text-xs text-rose-600 font-medium">
                              <span>Source: {match.source}</span>
                              <span>Date: {match.notice_date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
