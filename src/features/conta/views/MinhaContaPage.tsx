import { useState, useEffect } from 'react'
import { Header, Footer } from '@components/layout'
import { useAuthContext } from '../../auth/contexts/AuthContext'
import { updatePerfil, getMeusPedidos } from '../services/conta.service'
import type { PedidoConta } from '../services/conta.service'
import { supabase } from '@lib/supabase/client'

type Aba = 'dados' | 'pedidos' | 'senha'

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  processando: 'Processando',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  pago: 'bg-green-100 text-green-700',
  processando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-indigo-100 text-indigo-700',
  entregue: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-700',
}

export default function MinhaContaPage() {
  const { user } = useAuthContext()
  const [abaAtiva, setAbaAtiva] = useState<Aba>('dados')

  // ── Dados pessoais ──────────────────────────────
  const [nome, setNome] = useState(user?.nomeCompleto ?? '')
  const [telefone, setTelefone] = useState(user?.telefone ?? '')
  const [cpfCnpj, setCpfCnpj] = useState(user?.cpfCnpj ?? '')
  const [tipoPessoa, setTipoPessoa] = useState<'fisica' | 'juridica'>(user?.tipoPessoa ?? 'fisica')
  const [salvandoDados, setSalvandoDados] = useState(false)
  const [feedbackDados, setFeedbackDados] = useState<{ msg: string; tipo: 'ok' | 'erro' } | null>(null)

  // ── Pedidos ─────────────────────────────────────
  const [pedidos, setPedidos] = useState<PedidoConta[] | null>(null)
  const [loadingPedidos, setLoadingPedidos] = useState(false)

  // ── Senha ────────────────────────────────────────
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [feedbackSenha, setFeedbackSenha] = useState<{ msg: string; tipo: 'ok' | 'erro' } | null>(null)

  // Sincroniza campos se o user carregar depois
  useEffect(() => {
    if (user) {
      setNome(user.nomeCompleto ?? '')
      setTelefone(user.telefone ?? '')
      setCpfCnpj(user.cpfCnpj ?? '')
      setTipoPessoa(user.tipoPessoa ?? 'fisica')
    }
  }, [user])

  // Carrega pedidos ao trocar para a aba
  useEffect(() => {
    if (abaAtiva === 'pedidos' && pedidos === null && user) {
      setLoadingPedidos(true)
      getMeusPedidos(user.id).then(({ pedidos: p }) => {
        setPedidos(p)
        setLoadingPedidos(false)
      })
    }
  }, [abaAtiva, pedidos, user])

  function showFeedback(
    setter: typeof setFeedbackDados,
    msg: string,
    tipo: 'ok' | 'erro'
  ) {
    setter({ msg, tipo })
    setTimeout(() => setter(null), 4000)
  }

  async function handleSalvarDados(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSalvandoDados(true)
    const { error } = await updatePerfil(user.id, { nomeCompleto: nome, telefone, cpfCnpj, tipoPessoa })
    setSalvandoDados(false)
    if (error) {
      showFeedback(setFeedbackDados, 'Erro ao salvar: ' + error, 'erro')
    } else {
      showFeedback(setFeedbackDados, 'Dados atualizados com sucesso!', 'ok')
    }
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha !== confirmarSenha) {
      showFeedback(setFeedbackSenha, 'As senhas não coincidem', 'erro')
      return
    }
    if (novaSenha.length < 6) {
      showFeedback(setFeedbackSenha, 'A senha deve ter no mínimo 6 caracteres', 'erro')
      return
    }
    setSalvandoSenha(true)
    // Reautentica para verificar senha atual e depois atualiza
    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email: user!.email,
      password: senhaAtual,
    })
    if (reAuthError) {
      setSalvandoSenha(false)
      showFeedback(setFeedbackSenha, 'Senha atual incorreta', 'erro')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSalvandoSenha(false)
    if (error) {
      showFeedback(setFeedbackSenha, 'Erro ao alterar senha: ' + error.message, 'erro')
    } else {
      showFeedback(setFeedbackSenha, 'Senha alterada com sucesso!', 'ok')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
    }
  }

  const abas: { id: Aba; label: string }[] = [
    { id: 'dados', label: 'Dados pessoais' },
    { id: 'pedidos', label: 'Meus pedidos' },
    { id: 'senha', label: 'Segurança' },
  ]

  const inicialAvatar = (user?.nomeCompleto || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header />

      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-3xl px-4">

          {/* Cabeçalho do perfil */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white text-2xl font-bold shrink-0">
              {inicialAvatar}
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">{user?.nomeCompleto || 'Minha Conta'}</h1>
              <p className="text-sm text-neutral-500">{user?.email}</p>
              <span className="mt-1 inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 capitalize">
                {user?.role === 'admin' ? 'Administrador' : user?.role === 'funcionario' ? 'Funcionário' : 'Cliente'}
              </span>
            </div>
          </div>

          {/* Card principal */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">

            {/* Abas */}
            <div className="flex border-b border-neutral-200">
              {abas.map(aba => (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    abaAtiva === aba.id
                      ? 'border-b-2 border-brand text-brand'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {aba.label}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* ── ABA: DADOS PESSOAIS ─────────────────────── */}
              {abaAtiva === 'dados' && (
                <form onSubmit={handleSalvarDados} className="space-y-4">
                  {feedbackDados && (
                    <div className={`rounded-lg px-4 py-3 text-sm ${feedbackDados.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {feedbackDados.msg}
                    </div>
                  )}

                  {/* E-mail (somente leitura) */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">E-mail</label>
                    <input
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-neutral-400">O e-mail não pode ser alterado</p>
                  </div>

                  {/* Nome completo */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Nome completo</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Telefone</label>
                    <input
                      type="tel"
                      value={telefone}
                      onChange={e => setTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>

                  {/* Tipo de pessoa */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">Tipo de pessoa</label>
                    <div className="flex gap-3">
                      {(['fisica', 'juridica'] as const).map(tipo => (
                        <label
                          key={tipo}
                          className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border py-2 text-sm font-medium transition-colors ${
                            tipoPessoa === tipo
                              ? 'border-brand bg-brand/5 text-brand'
                              : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tipoPessoa"
                            value={tipo}
                            checked={tipoPessoa === tipo}
                            onChange={() => setTipoPessoa(tipo)}
                            className="sr-only"
                          />
                          {tipo === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* CPF / CNPJ */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      {tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ'}
                    </label>
                    <input
                      type="text"
                      value={cpfCnpj}
                      onChange={e => setCpfCnpj(e.target.value)}
                      placeholder={tipoPessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0001-00'}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={salvandoDados}
                    className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
                  >
                    {salvandoDados ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </form>
              )}

              {/* ── ABA: MEUS PEDIDOS ───────────────────────── */}
              {abaAtiva === 'pedidos' && (
                <div>
                  {loadingPedidos ? (
                    <div className="flex justify-center py-12">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
                    </div>
                  ) : !pedidos || pedidos.length === 0 ? (
                    <div className="py-12 text-center">
                      <svg className="mx-auto mb-3 h-12 w-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm text-neutral-500">Você ainda não fez nenhum pedido</p>
                      <a href="/produtos" className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
                        Ver produtos →
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-neutral-400 mb-4">{pedidos.length} pedido{pedidos.length > 1 ? 's' : ''} encontrado{pedidos.length > 1 ? 's' : ''}</p>
                      {pedidos.map(p => (
                        <div key={p.id} className="rounded-lg border border-neutral-200 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-mono text-xs text-neutral-400">
                                Pedido #{p.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="mt-1 text-sm text-neutral-600">
                                {p.itensCount} {p.itensCount === 1 ? 'item' : 'itens'} ·{' '}
                                {new Date(p.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit', month: 'long', year: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[p.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                                {STATUS_LABEL[p.status] ?? p.status}
                              </span>
                              <p className="mt-1 text-sm font-semibold text-neutral-800">
                                {p.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                            </div>
                          </div>

                          {/* Detalhes de valores */}
                          {(p.frete > 0 || p.desconto > 0) && (
                            <div className="mt-3 flex gap-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                              <span>Subtotal: {p.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                              {p.frete > 0 && <span>Frete: {p.frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>}
                              {p.desconto > 0 && <span className="text-green-600">Desconto: -{p.desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── ABA: SEGURANÇA ──────────────────────────── */}
              {abaAtiva === 'senha' && (
                <form onSubmit={handleAlterarSenha} className="space-y-4">
                  {feedbackSenha && (
                    <div className={`rounded-lg px-4 py-3 text-sm ${feedbackSenha.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {feedbackSenha.msg}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Senha atual</label>
                    <input
                      type="password"
                      value={senhaAtual}
                      onChange={e => setSenhaAtual(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Nova senha</label>
                    <input
                      type="password"
                      value={novaSenha}
                      onChange={e => setNovaSenha(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Confirmar nova senha</label>
                    <input
                      type="password"
                      value={confirmarSenha}
                      onChange={e => setConfirmarSenha(e.target.value)}
                      required
                      placeholder="Repita a nova senha"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={salvandoSenha || !senhaAtual || !novaSenha || !confirmarSenha}
                    className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
                  >
                    {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
