import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { IntroSection } from "./components/IntroSection";
import { ServicesSection } from "./components/ServicesSection";
import { PortfolioSection } from "./components/PortfolioSection";
import { WhyChooseSection } from "./components/WhyChooseSection";
import { ReviewsSection } from "./components/ReviewsSection";
import { ServiceAreasSection } from "./components/ServiceAreasSection";
import { QuoteSection } from "./components/QuoteSection";
import { ContactInstagramSection } from "./components/ContactInstagramSection";
import { Footer } from "./components/Footer";
import { MobileActionBar } from "./components/MobileActionBar";
import { AdminPanel } from "./components/AdminPanel";
import { MaintenanceScreen } from "./components/MaintenanceScreen";

function checkIsAdminRoute(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.pathname.startsWith("/admin") ||
    window.location.hash === "#admin"
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(checkIsAdminRoute);
  const [siteSettings, setSiteSettings] = useState<{
    isSiteLive: boolean;
    maintenanceMessage: string;
  }>({
    isSiteLive: true,
    maintenanceMessage: "",
  });
  const [preselectedService, setPreselectedService] = useState("");
  const [preselectedLocation, setPreselectedLocation] = useState("");

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch("/api/site-settings");
      const data = await res.json();
      if (data.ok && data.settings) {
        setSiteSettings({
          isSiteLive: data.settings.isSiteLive !== false,
          maintenanceMessage: data.settings.maintenanceMessage || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch site settings:", err);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdmin(checkIsAdminRoute());
    };

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleRouteChange);
    };
  }, []);

  const navigateToAdmin = () => {
    try {
      window.history.pushState(null, "", "/admin");
    } catch {
      window.location.hash = "#admin";
    }
    setIsAdmin(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToWebsite = () => {
    try {
      window.history.pushState(null, "", "/");
    } catch {
      window.location.hash = "";
    }
    setIsAdmin(false);
    fetchSiteSettings();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToQuote = () => {
    const el = document.getElementById("quote");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEnquireService = (serviceName: string) => {
    setPreselectedService(serviceName);
    scrollToQuote();
  };

  const handleSelectLocation = (locationName: string) => {
    setPreselectedLocation(locationName);
    scrollToQuote();
  };

  // If viewing admin route, always render AdminPanel
  if (isAdmin) {
    return (
      <AdminPanel
        onBackToWebsite={navigateToWebsite}
        onSiteStatusChange={(isLive) => {
          setSiteSettings((prev) => ({ ...prev, isSiteLive: isLive }));
        }}
      />
    );
  }

  // If site is turned OFF, public visitors see Maintenance Screen
  if (!siteSettings.isSiteLive) {
    return (
      <MaintenanceScreen
        onOpenAdmin={navigateToAdmin}
        maintenanceMessage={siteSettings.maintenanceMessage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main>
        <HeroSection />
        <IntroSection />
        <ServicesSection onEnquireService={handleEnquireService} />
        <PortfolioSection onEnquireProject={handleEnquireService} />
        <WhyChooseSection />
        <ReviewsSection />
        <ServiceAreasSection onSelectLocation={handleSelectLocation} />
        <QuoteSection
          preselectedService={preselectedService}
          preselectedLocation={preselectedLocation}
        />
        <ContactInstagramSection />
      </main>
      <Footer onOpenAdmin={navigateToAdmin} />
      <MobileActionBar />
    </div>
  );
}
