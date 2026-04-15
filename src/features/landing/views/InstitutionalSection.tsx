const items = [
  {
    icon: (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    ),
    title: 'Nossa Missão',
    description: 'Fornecer soluções industriais de alta qualidade com atendimento diferenciado.',
    accent: 'bg-brand-100 text-brand',
  },
  {
    icon: (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Certificações',
    description: 'Certificados ISO 9001 e ABNT para garantir a qualidade dos produtos.',
    accent: 'bg-success-light text-success-dark',
  },
  {
    icon: (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
    title: '+500 Clientes',
    description: 'Mais de 500 empresas confiam em nossos produtos e serviços.',
    accent: 'bg-info-light text-info-dark',
  },
  {
    icon: (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
    title: '20+ Anos',
    description: 'Mais de duas décadas de experiência no mercado industrial.',
    accent: 'bg-warning-light text-warning-dark',
  },
]

function InstitutionalSection() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand">Por que a A2 Brasil Supplies</p>
          <h2 className="text-neutral-900">Qualidade e confiança industrial</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {items.map(item => (
            <div
              key={item.title}
              className="group flex flex-col items-center rounded-2xl border border-neutral-100 bg-neutral-50 p-6 text-center transition-shadow hover:shadow-md"
            >
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${item.accent}`}>
                <div className="h-7 w-7">{item.icon}</div>
              </div>
              <h3 className="mb-2 text-base font-semibold text-neutral-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default InstitutionalSection
