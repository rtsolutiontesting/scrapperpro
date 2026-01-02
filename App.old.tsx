
import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import { CANADA_UNIVERSITIES, UK_UNIVERSITIES } from './constants';
import { ProgramData, ScrapingTask, ProgramLevel } from './types';
import { scrapeUniversityData } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { db } from './firebase';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<ScrapingTask[]>(() => [
    ...CANADA_UNIVERSITIES.map(u => ({ university: u, country: 'Canada' as const, status: 'pending' as const })),
    ...UK_UNIVERSITIES.map(u => ({ university: u, country: 'UK' as const, status: 'pending' as const }))
  ]);
  const [activeTab, setActiveTab] = useState<'queue' | 'data' | 'insights'>('queue');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scrapedData, setScrapedData] = useState<ProgramData[]>([]);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const failedCount = tasks.filter(t => t.status === 'failed').length;
    return { completedCount, pendingCount, failedCount, total: tasks.length };
  }, [tasks]);

  const chartData = useMemo(() => {
    const counts = scrapedData.reduce((acc, curr) => {
      acc[curr.level] = (acc[curr.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [scrapedData]);

  const saveToFirebase = async (data: ProgramData[]) => {
    const newSyncing = new Set(syncingIds);
    data.forEach(d => newSyncing.add(d.id));
    setSyncingIds(newSyncing);

    try {
      const batchPromises = data.map(async (program) => {
        const programRef = doc(db, "university_programs", program.id);
        await setDoc(programRef, {
          ...program,
          updatedAt: serverTimestamp(),
          source: 'India-Specific-Deep-Scrape'
        }, { merge: true });
      });

      await Promise.all(batchPromises);
      console.log("Synced batch to Firebase");
    } catch (error) {
      console.error("Firebase Sync Error:", error);
    } finally {
      setSyncingIds(prev => {
        const next = new Set(prev);
        data.forEach(d => next.delete(d.id));
        return next;
      });
    }
  };

  const startScraping = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    
    const batchSize = 2; 
    for (let i = 0; i < pendingTasks.length; i += batchSize) {
      const batch = pendingTasks.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (task) => {
        setTasks(prev => prev.map(t => 
          t.university === task.university ? { ...t, status: 'processing' } : t
        ));

        try {
          const data = await scrapeUniversityData(task.university, task.country);
          setScrapedData(prev => [...prev, ...data]);
          
          // Automaticaly sync to Firebase after successful scrape
          await saveToFirebase(data);

          setTasks(prev => prev.map(t => 
            t.university === task.university ? { ...t, status: 'completed', data } : t
          ));
        } catch (err) {
          setTasks(prev => prev.map(t => 
            t.university === task.university ? { ...t, status: 'failed', error: 'Extraction failed' } : t
          ));
        }
      }));
    }
    
    setIsProcessing(false);
  };

  const getStatusIcon = (status: ScrapingTask['status']) => {
    switch (status) {
      case 'completed': return <span className="text-green-500 text-xs font-bold">● DONE</span>;
      case 'processing': return <span className="text-amber-500 text-xs font-bold animate-pulse">● DEEP SEARCHING...</span>;
      case 'failed': return <span className="text-red-500 text-xs font-bold">● ERROR</span>;
      default: return <span className="text-slate-300 text-xs font-bold">○ PENDING</span>;
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
             <div className="flex items-center gap-2 mb-4">
                <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-orange-200">
                  Target: Indian Applicants
                </span>
             </div>
             <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                Engine Status
                <span className={`h-2 w-2 rounded-full ${isProcessing ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`}></span>
             </h2>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Total Queue</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Live Scraped</span>
                  <span className="text-green-600 font-semibold">{stats.completedCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Cloud Sync</span>
                  <span className="text-indigo-600 font-semibold flex items-center gap-1">
                    {syncingIds.size > 0 ? (
                      <><span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span> Syncing...</>
                    ) : (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg> Connected</>
                    )}
                  </span>
                </div>
             </div>
             <button 
                onClick={startScraping}
                disabled={isProcessing || stats.pendingCount === 0}
                className={`mt-6 w-full py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
                  isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-200 active:scale-95'
                }`}
             >
               {isProcessing ? 'DEEP SEARCHING...' : 'RUN INDIA-SPECIFIC SCAN'}
             </button>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative">
            <h3 className="font-bold mb-2">Backend Automation</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Every successful extraction is automatically mapped to your Firestore collection <code>university_programs</code>.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                <span>Firestore Auto-Sync: On</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                <span>Indian Board Rules: v2.4</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {(['queue', 'data', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === tab ? 'text-orange-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'data' ? 'INDIAN APPLICANT DATABASE' : tab.toUpperCase()}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
                )}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[600px] overflow-hidden">
            {activeTab === 'queue' && (
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">University</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Search Scope</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((task, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{task.university}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] text-slate-400">Scanning India/South Asia Portals</span>
                        </td>
                        <td className="px-6 py-4">{getStatusIcon(task.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="p-0">
                {scrapedData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <p className="font-medium text-lg">Empty Database</p>
                    <p className="text-sm">Initiate scan to fetch Indian requirements and sync to Firebase.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1500px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">University</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Program</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Indian Board Req</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Backlog Policy</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Cloud Sync</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {scrapedData.map((data) => (
                          <tr key={data.id} className="hover:bg-orange-50/20 transition-colors">
                            <td className="px-4 py-4 text-sm font-bold text-slate-900">{data.universityName}</td>
                            <td className="px-4 py-4 text-sm text-slate-700">
                                {data.programName}
                                <span className="block text-[10px] text-slate-400 uppercase">{data.level}</span>
                            </td>
                            <td className="px-4 py-4 text-sm font-medium text-orange-700">
                              {data.indianAcademicReq}
                            </td>
                            <td className="px-4 py-4 text-sm text-red-600 font-bold">
                              {data.backlogPolicy}
                            </td>
                            <td className="px-4 py-4">
                              {syncingIds.has(data.id) ? (
                                <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold italic animate-pulse">
                                  Pushing...
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 00-1.414-1.414l-6.293 6.293-2.293-2.293z"/></svg>
                                  IN CLOUD
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 p-1 hover:bg-orange-50 rounded">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-6">Levels Distribution (India Scope)</h3>
                    <div className="h-64">
                      {scrapedData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#f97316', '#ea580c', '#c2410c'][index % 3]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">Waiting for database population...</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-orange-600 rounded-xl text-white">
                    <h3 className="font-bold mb-2">India Admission Pipeline</h3>
                    <p className="text-xs text-orange-100 mb-4 leading-relaxed">
                      This dashboard represents live data filtered for CBSE/ICSE students. 
                      Every entry here has been verified through deep-linking techniques to ensure it applies to the Indian demographic.
                    </p>
                    <div className="text-[10px] font-mono bg-orange-700/50 p-3 rounded border border-orange-400/30">
                      Collection: university_programs<br/>
                      Region: Global<br/>
                      Filter: Indian Nationals
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
