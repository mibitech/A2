import { useAuthContext } from '../../auth/contexts/AuthContext'

const statCards = [
  {
    label: 'Pedidos hoje',
    value: '—',
    description: 'Em breve disponível',
    color: 'text-info',
    bg: 'bg-info-light',
  },
  {
    label: 'Receita do mês',
    value: '—',
    description: 'Em breve disponível',
    color: 'text-success',
    bg: 'bg-success-light',
  },
  {
    label: 'Produtos ativos',
    value: '—',
    description: 'Em breve disponível',
    color: 'text-brand-600',
    bg: 'bg-brand-light',
  },
  {
    label: 'Clientes',
    value: '—',
    description: 'Em breve disponível',
    color: 'text-warning',
    bg: 'bg-warning-light',
  },
]

const modules = [
  { name: 'Estoque', href: '/admin/estoque', status: 'Em breve', description: 'CRUD de produtos e controle de estoque mínimo' },
  { name: 'Pedidos', href: '/admin/pedidos', status: 'Em breve', description: 'Listagem e atualização de status dos pedidos' },
  { name: 'Clientes', href: '/admin/clientes', status: 'Em breve', description: 'Perfis de clientes e histórico de compras' },
  { name: 'Financeiro', href: '/admin/financeiro', status: 'Em breve', description: 'Conciliação Stripe e relatórios de caixa' },
]

export default function AdminDashboard() {
  const { user } = useAuthContext()

  const firstName = user?.nomeCompleto?.split(' ')[0] || user?.email?.split('@')[0] || 'usuário'

  return (
    <div className="p-8 max-w-6xl">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-h4 text-neutral-900">
          Olá, {firstName}
        </h1>
        <p className="text-body-sm text-neutral-500 mt-1">
          Bem-vindo ao painel administrativo da A2Tech.
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 shadow-card border border-neutral-200"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.bg} mb-3`}>
              <span className={`text-lg font-bold ${card.color}`}>—</span>
            </div>
            <p className="text-xs text-neutral-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-neutral-400 mt-1">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Módulos disponíveis */}
      <div className="bg-white rounded-xl shadow-card border border-neutral-200 p-6">
        <h2 className="text-h6 text-neutral-800 mb-1">Módulos do sistema</h2>
        <p className="text-body-sm text-neutral-500 mb-5">
          Os módulos abaixo serão implementados no Épico 8 em diante.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className="flex items-start gap-4 p-4 rounded-lg border border-neutral-200 bg-neutral-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-neutral-800">{mod.name}</span>
                  <span className="text-xs text-neutral-400 bg-neutral-200 px-2 py-0.5 rounded-full">
                    {mod.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">{mod.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
