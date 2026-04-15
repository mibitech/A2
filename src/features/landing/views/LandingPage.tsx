import { Header, BenefitsBar, Footer } from '@components/layout'
import HeroSection from './HeroSection'
import FeaturedProducts from './FeaturedProducts'
import InstitutionalSection from './InstitutionalSection'

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={0} />
      <BenefitsBar />
      
      <main className="flex-1">
        <HeroSection />
        <FeaturedProducts />
        <InstitutionalSection />
      </main>
      
      <Footer />
    </div>
  )
}

export default LandingPage
