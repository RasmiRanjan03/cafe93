import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import ScrollProgress from './components/ScrollProgress';
import SmoothScroll from './components/SmoothScroll';
import { FlavorProvider } from './components/FlavorContext';
import HeroSection from './sections/HeroSection';
import MomoCollection from './sections/MomoCollection';
import ExperienceSection from './sections/ExperienceSection';
import SignatureFlavors from './sections/SignatureFlavors';
import StorySection from './sections/StorySection';
import TestimonialsSection from './sections/TestimonialsSection';
import VisitSection from './sections/VisitSection';
import { getStructuredData } from './data/siteConfig';
import { hasWebGL } from './hooks/useDevice';

const SharedCanvas = lazy(() => import('./three/SharedCanvas'));

export default function App() {
  const [ready, setReady] = useState(false);
  const [webgl] = useState(hasWebGL);
  const onReady = useCallback(() => setReady(true), []);

  // never trap visitors behind the loader
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // LocalBusiness structured data, only when real details are configured
  useEffect(() => {
    const data = getStructuredData();
    if (!data) return;
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(data);
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  return (
    <FlavorProvider>
      <SmoothScroll />
      <Loader done={ready} />
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <HeroSection onReady={onReady} />
        <MomoCollection />
        <ExperienceSection />
        <SignatureFlavors />
        <StorySection />
        <TestimonialsSection />
        <VisitSection />
      </main>
      <Footer />
      {/* the shared canvas for all below-the-fold 3D views loads after the hero */}
      {webgl && ready && (
        <Suspense fallback={null}>
          <SharedCanvas />
        </Suspense>
      )}
    </FlavorProvider>
  );
}
