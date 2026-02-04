// src/components/LoyaltyBadge.jsx

function getTierConfig(tier) {
  switch (tier) {
    case 'PLATINUM':
      return {
        label: 'Platinum',
        subtitle: 'Client VIP',
        classes:
          'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-slate-50 border border-slate-500',
        icon: 'diamond',
      };
    case 'GOLD':
      return {
        label: 'Gold',
        subtitle: 'Client premium',
        classes:
          'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 border border-amber-500',
        icon: 'military_tech',
      };
    case 'SILVER':
      return {
        label: 'Silver',
        subtitle: 'Client fidèle',
        classes:
          'bg-gradient-to-r from-slate-200 to-slate-100 text-slate-800 border border-slate-300',
        icon: 'workspace_premium',
      };
    case 'BASIC':
    default:
      return {
        label: 'Basic',
        subtitle: 'Nouveau client',
        classes:
          'bg-slate-100 text-slate-700 border border-slate-200',
        icon: 'person',
      };
  }
}

export default function LoyaltyBadge({ tier }) {
  const { label, subtitle, classes, icon } = getTierConfig(tier);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-medium shadow-sm ${classes}`}
    >
      <span className="material-symbols-outlined text-sm">
        {icon}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[11px] uppercase tracking-wide">
          Niveau de fidélité
        </span>
        <span className="text-xs font-semibold">
          {label}
          {subtitle && (
            <span className="ml-1 text-[10px] opacity-80">
              · {subtitle}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}