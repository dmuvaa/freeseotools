import { ChatInterface } from "@/components/seo-chat/ChatInterface";

export const metadata = {
  title: "AI Agent | Free SEO Tools",
  description: "Chat with our autonomous SEO agent that can run real-time audits securely.",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[var(--background)] px-4 py-6 md:px-8">
      <div className="w-full h-full max-w-6xl mx-auto flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}
