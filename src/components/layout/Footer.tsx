import { Link } from 'react-router-dom'

const productLinks = [
  { to: '/produtos/cabos-de-aco', label: 'Cabos de Aço' },
  { to: '/produtos/cintas-de-elevacao', label: 'Cintas de Elevação' },
  { to: '/produtos/correntes', label: 'Correntes' },
  { to: '/produtos/lingas', label: 'Lingas' },
  { to: '/produtos/manilhas', label: 'Manilhas' },
  { to: '/produtos/acessorios', label: 'Acessórios' },
]

const institutionalLinks = [
  { to: '/sobre', label: 'Sobre a A2 Brasil Supplies' },
  { to: '/certificacoes', label: 'Certificações' },
  { to: '/qualidade', label: 'Política de Qualidade' },
  { to: '/blog', label: 'Blog' },
  { to: '/trabalhe-conosco', label: 'Trabalhe Conosco' },
]

const supportLinks = [
  { to: '/ajuda', label: 'Central de Ajuda' },
  { to: '/meus-pedidos', label: 'Meus Pedidos' },
  { to: '/trocas-devolucoes', label: 'Trocas e Devoluções' },
  { to: '/privacidade', label: 'Política de Privacidade' },
  { to: '/termos', label: 'Termos de Uso' },
]

function FooterLinkList({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">{title}</h3>
      <ul className="space-y-2.5">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-neutral-900">
      {/* Main content */}
      <div className="border-b border-neutral-800 py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">

            <FooterLinkList title="Produtos" links={productLinks} />
            <FooterLinkList title="Institucional" links={institutionalLinks} />
            <FooterLinkList title="Atendimento" links={supportLinks} />

            {/* Contato */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">Contato</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-neutral-200">(11) 3333-4444</p>
                    <p className="text-xs text-neutral-500">Segunda a sexta, 8h às 18h</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-neutral-200">contato@a2tech.com.br</p>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-neutral-200">São Paulo - SP</p>
                    <p className="text-xs text-neutral-500">Rua Industrial, 123 - Centro</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">Redes Sociais</h3>
              <div className="flex gap-3">
                {[
                  {
                    href: 'https://facebook.com',
                    label: 'Facebook',
                    icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />,
                  },
                  {
                    href: 'https://instagram.com',
                    label: 'Instagram',
                    icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />,
                  },
                  {
                    href: 'https://linkedin.com',
                    label: 'LinkedIn',
                    icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />,
                  },
                  {
                    href: 'https://youtube.com',
                    label: 'YouTube',
                    icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />,
                  },
                ].map(({ href, label, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 transition-colors hover:bg-brand hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">{icon}</svg>
                  </a>
                ))}
              </div>

              <p className="mt-6 text-xs text-neutral-500">
                Em breve: App A2 Brasil Supplies nas lojas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-neutral-500 md:flex-row">
            <p>© 2026 A2 Brasil Supplies · Todos os direitos reservados</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Compra Segura</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                <span>Até 12x sem juros</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                <span>Frete Grátis acima de R$ 500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
