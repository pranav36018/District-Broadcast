import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, Search, Mail, MapPin, CheckCircle2 } from 'lucide-react';

export default function Users() {
  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/districts')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setDistricts(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const adminUser = {
    id: 1,
    name: 'State Administrator',
    email: 'admin@connectkarnataka.demo',
    role: 'Super Admin',
    district: 'State-wide (All 31 Districts)',
    status: 'Active'
  };

  const inchargeUsers = districts.map((d, idx) => {
    const slug = d.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = d.incharge_email || (d.name === 'Bengaluru' ? 'bengaluru@connectkarnataka.demo' : `${slug}@connectkarnataka.demo`);
    return {
      id: idx + 2,
      name: d.incharge_name || `${d.name} Coordinator`,
      email,
      role: 'District In-charge',
      district: d.name,
      status: 'Active'
    };
  });

  const allUsers = [adminUser, ...inchargeUsers];

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.district.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಬಳಕೆದಾರರು ಮತ್ತು ಪ್ರವೇಶ ನಿಯಂತ್ರಣ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ಎಲ್ಲಾ 31 ಕರ್ನಾಟಕ ಆಡಳಿತ ಜಿಲ್ಲೆಗಳಾದ್ಯಂತ ಸೂಪರ್ ಅಡ್ಮಿನಿಸ್ಟ್ರೇಟರ್ ಮತ್ತು ನಿಯೋಜಿತ ಉಸ್ತುವಾರಿಗಳು
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ಬಳಕೆದಾರರ ಹೆಸರು, ಜಿಲ್ಲೆ ಅಥವಾ ಇಮೇಲ್ ಮೂಲಕ ಹುಡುಕಿ (ಉದಾಹರಣೆಗೆ ಸುರೇಶ್ ಗೌಡ, ಮೈಸೂರು)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
          {filteredUsers.length} ಪೈಕಿ {allUsers.length} ಬಳಕೆದಾರರು
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="py-3.5 px-6">ಹೆಸರು</th>
                <th className="py-3.5 px-4">ಇಮೇಲ್</th>
                <th className="py-3.5 px-4">ಪಾತ್ರ</th>
                <th className="py-3.5 px-4">ವ್ಯಾಪ್ತಿ</th>
                <th className="py-3.5 px-6 text-center">ಸ್ಥಿತಿ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                      {u.name.slice(0, 2)}
                    </div>
                    <div>
                      <span>{u.name}</span>
                      {u.district === 'Bengaluru' && (
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                          ಡೆಮೊ ಉಸ್ತುವಾರಿ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      u.role === 'Super Admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">{u.district}</td>
                  <td className="py-3.5 px-6 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      ● ಸಕ್ರಿಯ
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
