import React from 'react';
import { MadarNavbar } from '../components/layout/MadarNavbar.tsx';
import { HeroSection } from '../components/home/HeroSection.tsx';
import { FeatureStrip } from '../components/home/FeatureStrip.tsx';
import { HowItWorks } from '../components/home/HowItWorks.tsx';
import { TemplateShowcase } from '../components/home/TemplateShowcase.tsx';
import { FinalCTA } from '../components/home/FinalCTA.tsx';
import { MadarFooter } from '../components/layout/MadarFooter.tsx';
import { MadarLoadingScreen } from '../components/layout/MadarLoadingScreen.tsx';

export const Home: React.FC = () => {
  return (
    <MadarLoadingScreen>
      <div className="min-h-screen bg-[#070F1B] text-[#F7F3EE] madar-ambient-bg flex flex-col selection:bg-[#D8C3A5]/25 selection:text-[#F0DFCA]">
        {/* Top Sticky Navigation */}
        <MadarNavbar />

        {/* Main Content Sections matching Image 1 */}
        <main className="flex-1">
          {/* 1. Hero Section (Text + Interactive Laptop & Phone Mockups) */}
          <HeroSection />

          {/* 2. Feature Strip (5 Core Pillars) */}
          <FeatureStrip />

          {/* 3. How It Works (3 Steps + Interactive Template Browser) */}
          <HowItWorks />

          {/* 4. Showcase & Real Templates */}
          <TemplateShowcase />

          {/* 5. Final CTA with Luxury Architectural Backdrop & Stats */}
          <FinalCTA />
        </main>

        {/* Footer */}
        <MadarFooter />
      </div>
    </MadarLoadingScreen>
  );
};
