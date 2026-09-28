import React, { useState, useEffect } from 'react';
import { ClipboardList, UserCheck, Users, MapPin, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Assignments({ onNavigateToTab, onShowToast }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reassignModal, setReassignModal] = useState(null); // district object
  const [newIncharge, setNewIncharge] = useState('Suresh Gowda');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assignments');
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReassign = () => {
    if (!reassignModal) return;
    setAssignments((prev) =>
      prev.map((a) =>
        a.district === reassignModal.district ? { ...a, incharge_name: newIncharge } : a
      )
    );
    if (onShowToast) {
      onShowToast(`Jurisdiction for ${reassignModal.district} reassigned to ${newIncharge}`, 'success');
    }
    setReassignModal(null);
  };

  const filteredAssignments = assignments.filter((a) =>
    a.district.toLowerCase().includes(search.toLowerCase()) ||
    (a.incharge_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            <span>District In-Charge Assignments</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign and reallocate contact blocks across regional district coordinators
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          className="p-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Roster</span>
        </button>
      </div>

      {/* Search Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search district or in-charge coordinator (e.g. Mysuru, Belagavi, Suresh Gowda)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
          {filteredAssignments.length} of {assignments.length} Districts
        </span>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">District Coordinator Roster</h2>
            <p className="text-xs text-slate-500">Live deployment of in-charges across Karnataka</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="py-3.5 px-6">District</th>
                <th className="py-3.5 px-4">Designated In-charge</th>
                <th className="py-3.5 px-4 text-right">Assigned Contacts</th>
                <th className="py-3.5 px-4 text-right">Completed</th>
                <th className="py-3.5 px-4 text-right">Pending</th>
                <th className="py-3.5 px-4 text-center">Progress</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredAssignments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* District */}
                  <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{item.district}</span>
                    {item.district === 'Bengaluru' && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase">
                        Primary Demo
                      </span>
                    )}
                  </td>

                  {/* In-charge */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                        {item.incharge_name ? item.incharge_name.slice(0, 2) : 'NA'}
                      </div>
                      <span className="text-xs font-semibold text-slate-800">
                        {item.incharge_name || 'Unassigned'}
                      </span>
                    </div>
                  </td>

                  {/* Assigned Contacts */}
                  <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-700">
                    {item.total_contacts.toLocaleString('en-IN')}
                  </td>

                  {/* Completed */}
                  <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-emerald-700">
                    {item.called.toLocaleString('en-IN')}
                  </td>

                  {/* Pending */}
                  <td className="py-3.5 px-4 text-right font-mono text-xs text-amber-700">
                    {item.pending.toLocaleString('en-IN')}
                  </td>

                  {/* Progress */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${item.completion_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {item.completion_rate}%
                      </span>
                    </div>
                  </td>

                  {/* Actions (Assign Contacts | Reassign | View Contacts) */}
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setReassignModal(item);
                          setNewIncharge(item.incharge_name || 'Suresh Gowda');
                        }}
                        className="py-1 px-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Reassign
                      </button>
                      <button
                        onClick={() => onNavigateToTab('contacts')}
                        className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
                      >
                        View Contacts
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REASSIGN MODAL */}
      {reassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Reassign District Jurisdiction
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select the new coordinator responsible for {reassignModal.district} contacts ({reassignModal.total_contacts.toLocaleString('en-IN')}).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Designated District In-charge
                </label>
                <select
                  value={newIncharge}
                  onChange={(e) => setNewIncharge(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {assignments.map((a) => (
                    <option key={a.id} value={a.incharge_name || a.district}>
                      {a.incharge_name || 'Unassigned'} ({a.district})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignModal(null)}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReassign}
                  className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  Confirm Reassignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
