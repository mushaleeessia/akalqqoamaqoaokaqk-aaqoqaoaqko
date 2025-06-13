
import { ProfileSection } from "@/components/ProfileSection";
import { BlogSection } from "@/components/BlogSection";
import { ForeignerNotice } from "@/components/ForeignerNotice";
import { useState, useEffect } from "react";

const Index = () => {
  const [isEnglish, setIsEnglish] = useState(false);

  // Listen for language changes from Header component
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setIsEnglish(event.detail.isEnglish);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Foreigner Notice */}
        {isEnglish && (
          <div className="mb-8">
            <ForeignerNotice />
          </div>
        )}
        
        {/* Profile Section */}
        <ProfileSection />
        
        {/* Blog Section */}
        <BlogSection />
      </div>
    </div>
  );
};

export default Index;
