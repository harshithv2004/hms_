import React from 'react';
import { Users, UserCheck, UserMinus, Building2, AlertCircle } from 'lucide-react';

export default function StatCards({ stats = { total: 0, admitted: 0, discharged: 0 }, loading }) {
  const cards = [
    {
      title: 'Total Patients',
      value: stats.total,
      description: 'Lifetime admission records',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Currently Admitted',
      value: stats.admitted,
      description: 'Occupying ward beds',
      icon: UserCheck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      title: 'Discharged Patients',
      value: stats.discharged,
      description: 'Successfully discharged',
      icon: UserMinus,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Active Departments',
      value: '8 Units',
      description: 'Full specialty coverage',
      icon: Building2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {loading ? (
                  <span className="inline-block w-12 h-6 bg-slate-200 rounded animate-pulse"></span>
                ) : (
                  card.value
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{card.description}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bgColor} ${card.borderColor} border`}>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
