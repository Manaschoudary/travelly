import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import TripPlannerSection from "@/components/sections/TripPlannerSection";
import FlightSearchSection from "@/components/sections/FlightSearchSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import DestinationsSection from "@/components/sections/DestinationsSection";
import PhotoGallerySection from "@/components/sections/PhotoGallerySection";
import GroupPackagesSection from "@/components/sections/GroupPackagesSection";
import GroupTripsSection from "@/components/sections/GroupTripsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TripPlannerSection />
      <FlightSearchSection />
      <HowItWorksSection />
      <DestinationsSection />
      <PhotoGallerySection />
      <GroupPackagesSection />
      <GroupTripsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
