import React from 'react';
import {
  Smartphone,
  Lock,
  Unlock,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

export default function StatsCards({ devices = [] }) {
  const totalCount = devices.length;
  const lockedCount = devices.filter(d => d.status === 'LOCKED').length;
  const unlockedCount = devices.filter(d => d.status === 'UNLOCKED').length;
  const releasedCount = devices.filter(d => d.status === 'RELEASED').length;

  const totalFinancedValue = devices.reduce((sum, d) => sum + (d.financing?.totalAmount || 0), 0);
  const totalCollected = devices.reduce((sum, d) => sum + (d.financing?.totalPaid || 0), 0);
  const totalOutstanding = Math.max(0, totalFinancedValue - totalCollected);

  const stats = [
    {
      title: 'Total Enrolled Fleet',
      value: totalCount,
      subtext: 'Financed Android Handsets',
      icon: Smartphone,
      color: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
      badge: `${totalCount} Handsets`
    },
    {
      title: 'Active Locked (Overdue)',
      value: lockedCount,
      subtext: 'Kiosk Payment Lock Enforced',
      icon: Lock,
      color: 'from-rose-500/20 to-red-500/10',
      borderColor: 'border-rose-500/40',
      textColor: 'text-rose-400',
      badge: lockedCount > 0 ? `${lockedCount} Requires Settlement` : 'All Clear',
      pulse: lockedCount > 0
    },
    {
      title: 'Active Unlocked',
      value: unlockedCount,
      subtext: 'Payment Schedule Current',
      icon: Unlock,
      color: 'from-emerald-500/20 to-teal-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      badge: `${Math.round((unlockedCount / (totalCount || 1)) * 100)}% Compliant`
    },
    {
      title: 'Released / Paid Off',
      value: releasedCount,
      subtext: 'Kiosk Security Removed',
      icon: CheckCircle2,
      color: 'from-purple-500/20 to-indigo-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      badge: 'Ownership Granted'
    },
    {
      title: 'Capital Collected',
      value: `$${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: `Out of $${totalFinancedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} Total`,
      icon: DollarSign,
      color: 'from-amber-500/20 to-yellow-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      badge: `${Math.round((totalCollected / (totalFinancedValue || 1)) * 100)}% Recovered`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-4 bg-slate-900/60 border ${stat.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {stat.title}
                </p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
                    {stat.value}
                  </h3>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 ${stat.textColor}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
              <span className="text-slate-400 truncate mr-2">{stat.subtext}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${stat.pulse ? 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                {stat.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
