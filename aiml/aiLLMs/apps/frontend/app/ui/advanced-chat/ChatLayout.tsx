"use client";

import ChatSidebar from "./ChatSidebar";
import MedicalChat from "./MedicalChat";

export default function ChatLayout() {
  return (
    <div className="flex h-[90vh] w-full">
      <ChatSidebar />
      <div className="flex-1 p-4">
        <MedicalChat />
      </div>
    </div>
  );
}
