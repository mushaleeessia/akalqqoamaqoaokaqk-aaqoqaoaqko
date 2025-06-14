
import { useState } from "react";
import { Header } from "@/components/Header";
import { ProfileSection } from "@/components/ProfileSection";
import { BlogSection } from "@/components/BlogSection";
import { LinkCard } from "@/components/LinkCard";
import { Footer } from "@/components/Footer";
import { HelpAssistant } from "@/components/HelpAssistant";

const Index = () => {
  const [isEnglish, setIsEnglish] = useState(false);

  const handleLanguageChange = (english: boolean) => {
    setIsEnglish(english);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
      <Header onLanguageChange={handleLanguageChange} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-12">
        <ProfileSection isEnglish={isEnglish} />
        <BlogSection isEnglish={isEnglish} />
        <LinkCard isEnglish={isEnglish} />
      </main>
      
      <Footer isEnglish={isEnglish} />
      <HelpAssistant isEnglish={isEnglish} />
    </div>
  );
};

export default Index;
