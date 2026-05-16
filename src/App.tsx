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
  const [apiKey, setApiKey] = useState('');
  
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
    if (apiKey) formData.append('api_key', apiKey);

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
    <div className="h-screen w-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col overflow-hidden">
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold text-xl italic text-white">M</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none mb-1">MACHO YA ARDHI</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">Kenyan Land Fraud Detection Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 hidden md:flex">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-slate-300">Gemini Vision Pro v1.5 Connected</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-700 hidden md:block"></div>
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">JD</div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        
        {/* Left Col: Upload Form */}
        <section className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Stress-Test Your Transaction</h2>
            <p className="text-gray-500 text-sm">Upload title deeds, search certificates, and transfer forms. Our AI cross-checks details across documents and the Kenya Gazette database to identify fraud indicators before you buy.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col shrink-0">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileUp className="w-4 h-4 text-blue-600" />
              Document Analysis Queue
            </h2>
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-slate-50 mb-4 transition-colors cursor-pointer hover:bg-slate-100",
                files.length > 0 ? "border-blue-300" : "border-slate-200"
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
              <p className="text-xs text-slate-500 text-center mb-2 font-medium">Drag & drop images of Title Deeds, Mutation Forms, or Sale Agreements (Any format)</p>
              <button type="button" className="text-xs bg-blue-600 text-white px-4 py-2 rounded font-semibold pointer-events-none">Browse Files</button>
            </div>

            {files.length > 0 && (
              <div className="space-y-3 overflow-y-auto pr-2 max-h-40 mb-4 text-left">
                {files.map((file, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-xs font-bold">
                       {file.type.includes('pdf') ? 'PDF' : 'IMG'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-slate-800">{file.name}</p>
                      <p className="text-[10px] text-slate-400">Ready for extraction</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mt-2 mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Transaction Context & settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Gemini API Key (Optional if set in environment)</label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full text-xs font-medium border-b border-slate-200 pb-1 focus:outline-none focus:border-blue-500 bg-transparent text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Expected Parcel Number</label>
                  <input 
                    type="text" 
                    value={parcelNumber}
                    onChange={e => setParcelNumber(e.target.value)}
                    placeholder="e.g. KJD/Kaputiei/1234"
                    className="w-full text-xs font-medium border-b border-slate-200 pb-1 focus:outline-none focus:border-blue-500 bg-transparent text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Expected Seller Name</label>
                  <input 
                    type="text" 
                    value={sellerName}
                    onChange={e => setSellerName(e.target.value)}
                    placeholder="Name of individual or company"
                    className="w-full text-xs font-medium border-b border-slate-200 pb-1 focus:outline-none focus:border-blue-500 bg-transparent text-slate-800"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || files.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 px-4 py-3 rounded text-sm font-bold text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                 <span className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                   Analyzing...
                 </span>
              ) : (
                <>VERIFY TRANSACTION</>
              )}
            </button>
            {error && (
              <p className="text-xs font-medium text-red-600 bg-red-50 p-3 rounded mt-3 border border-red-100">
                {error}
              </p>
            )}
          </form>

          {/* Helper Panel */}
          <div className="bg-slate-100 rounded-xl p-5 text-xs text-slate-600 space-y-2 shrink-0 border border-slate-200">
            <p className="font-bold text-slate-800">Demo Parcel Numbers:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>KJD/Kaputiei/1234</li>
              <li>Nairobi/Block/82/733</li>
            </ul>
          </div>
        </section>

        {/* Right Col: Results */}
        <section className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {!report && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50"
              >
                <FileSearch2 className="w-16 h-16 mb-4 text-slate-300" />
                <p className="text-lg font-bold text-slate-500">Awaiting Submissions</p>
                <p className="text-sm text-center max-w-sm mt-2 font-medium">Upload land transaction documents to generate an instant fraud risk assessment report.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center space-y-4 rounded-xl border border-slate-200 bg-white"
              >
                <div className="relative">
                  <ShieldAlert className="w-16 h-16 text-blue-100 animate-pulse" />
                  <Search className="w-8 h-8 text-blue-600 absolute bottom-0 right-0 animate-bounce" />
                </div>
                <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">Agent extracting & cross-referencing...</p>
              </motion.div>
            )}

            {report && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex flex-col gap-6 h-full overflow-hidden"
              >
                {/* Summary Header */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 grid grid-cols-4 items-center shrink-0">
                  <div className="col-span-1 border-r border-slate-100 pr-4">
                    <div className="text-xs text-slate-500 mb-1">Risk Score</div>
                    <div className={cn(
                      "text-4xl font-black",
                      report.risk_level === 'HIGH' ? "text-red-600" :
                      report.risk_level === 'MEDIUM' ? "text-orange-500" :
                      "text-green-600"
                    )}>
                      {report.risk_score}<span className="text-sm font-medium text-slate-400 italic">/100</span>
                    </div>
                    <div className={cn(
                      "mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block uppercase",
                      report.risk_level === 'HIGH' ? "bg-red-100 text-red-700" :
                      report.risk_level === 'MEDIUM' ? "bg-orange-100 text-orange-700" :
                      "bg-green-100 text-green-700"
                    )}>
                      {report.risk_level} RISK
                    </div>
                  </div>
                  <div className="col-span-3 pl-8 grid grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Gazette Status</div>
                      <div className={cn(
                        "text-sm font-bold flex items-center gap-1",
                        report.gazette_matches.length > 0 ? "text-red-600" : "text-slate-800"
                      )}>
                        {report.gazette_matches.length > 0 ? "Conflict Found" : "Clear"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Extraction Confidence</div>
                      <div className="text-sm font-bold text-slate-800">
                        {Math.min(...report.extracted_documents.map(d => d.confidence))}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Data Consistency</div>
                      <div className={cn(
                        "text-sm font-bold",
                        report.inconsistencies.length > 0 ? "text-orange-500" : "text-green-600"
                      )}>
                        {report.inconsistencies.length > 0 ? "Mismatches Found" : "Consistent"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis Tabs Container */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                  <div className="border-b border-slate-100 flex gap-8 px-6 shrink-0 bg-slate-50">
                    <button className="py-4 text-xs font-bold border-b-2 border-blue-600 text-blue-600">Verification Report</button>
                    <button className="py-4 text-xs font-bold text-slate-400 pointer-events-none">Extracted Data</button>
                    <button className="py-4 text-xs font-bold text-slate-400 pointer-events-none">Audit Log</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0">
                    {/* Findings */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Key Fraud Risk Findings</h4>
                      {report.inconsistencies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {report.inconsistencies.map((inc, i) => {
                             // Basic heuristic to colour code findings based on keywords
                             const isGazette = inc.toLowerCase().includes('gazette');
                             const isTamper = inc.toLowerCase().includes('tamper') || inc.toLowerCase().includes('suspicious');
                             const isMismatch = inc.toLowerCase().includes('mismatch');
                             
                             let bgClass = "bg-slate-50 border-slate-200";
                             let textClass = "text-slate-600";
                             let titleClass = "text-slate-800";
                             let title = "Finding";
                             
                             if (isGazette || isTamper) {
                                bgClass = "bg-red-50 border-red-100";
                                textClass = "text-red-700";
                                titleClass = "text-red-800";
                                title = isGazette ? "Gazette Dispute" : "Suspicious Alteration";
                             } else if (isMismatch) {
                                bgClass = "bg-orange-50 border-orange-100";
                                textClass = "text-orange-700";
                                titleClass = "text-orange-800";
                                title = "Data Mismatch";
                             } else {
                                bgClass = "bg-orange-50 border-orange-100";
                                textClass = "text-orange-700";
                                titleClass = "text-orange-800";
                                title = "Anomaly Detected";
                             }

                             return (
                              <div key={i} className={cn("p-4 rounded-lg border", bgClass)}>
                                <div className={cn("text-xs font-bold mb-1", titleClass)}>{title}</div>
                                <p className={cn("text-[10px] leading-relaxed", textClass)}>{inc}</p>
                              </div>
                             )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No critical anomalies detected in the submitted documents.</p>
                      )}
                    </div>
                    
                    {/* Recommendations List */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Next Steps & Recommendations</h4>
                       <ul className="space-y-3">
                        {report.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-2 text-xs text-slate-700 items-start p-3 bg-slate-50 rounded border border-slate-100">
                            <ChevronRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <span className="font-medium">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quick Extracted Data Table */}
                    <div>
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Primary Document Details</h4>
                       <table className="w-full text-left">
                          <thead>
                            <tr className="text-[10px] text-slate-400 uppercase tracking-wider">
                              <th className="pb-3 border-b border-slate-200 font-semibold">Field Detail</th>
                              <th className="pb-3 border-b border-slate-200 font-semibold">Extracted Value</th>
                              <th className="pb-3 border-b border-slate-200 font-semibold">Format</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs">
                             {report.extracted_documents.slice(0, 1).map((doc, docIdx) => (
                               <React.Fragment key={docIdx}>
                                <tr className="border-b border-slate-50">
                                  <td className="py-3 text-slate-500">Parcel Number</td>
                                  <td className="py-3 font-bold">{doc.parcel_number || "N/A"}</td>
                                  <td className="py-3 text-slate-400">{doc.document_type || "Unknown"}</td>
                                </tr>
                                <tr className="border-b border-slate-50">
                                  <td className="py-3 text-slate-500">Registered Owner</td>
                                  <td className="py-3 font-bold">{doc.registered_owner || "N/A"}</td>
                                  <td className="py-3 text-slate-400">Owner Field</td>
                                </tr>
                                <tr className="border-b border-slate-50">
                                  <td className="py-3 text-slate-500">Registry Stamp</td>
                                  <td className="py-3 font-bold">{doc.registry || "N/A"}</td>
                                  <td className="py-3">
                                      {doc.stamp_present ? (
                                        <span className="text-[10px] px-2 py-0.5 bg-green-100 border border-green-200 text-green-700 rounded-full font-bold">STAMPED</span>
                                      ) : (
                                        <span className="text-[10px] px-2 py-0.5 bg-red-100 border border-red-200 text-red-700 rounded-full font-bold">MISSING</span>
                                      )}
                                  </td>
                                </tr>
                               </React.Fragment>
                             ))}
                          </tbody>
                       </table>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
      
      {/* System Footer Bar */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Environment:</span>
            <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 bg-slate-100 rounded">STAGING</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Engine:</span>
            <span className="text-[10px] font-bold text-slate-600">Gemini Vision v1.5</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <div className="text-[10px] text-slate-500 font-medium">© 2026 Macho Ya Ardhi</div>
        </div>
      </footer>
    </div>
  );
}
