import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/sections/Hero'
import FeaturedProduct from '@/components/sections/FeaturedProduct'
import WorkList from '@/components/sections/WorkList'
import Manifesto from '@/components/sections/Manifesto'
import Contact from '@/components/sections/Contact'
import Marquee from '@/components/motion/Marquee'
import ScrollThread from '@/components/motion/ScrollThread'
import CardStack from '@/components/motion/CardStack'

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <ScrollThread />
        <CardStack />
        <Hero />
        <Marquee />
        <FeaturedProduct />
        <WorkList />
        <Marquee inverted speed={40} />
        <Manifesto />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
