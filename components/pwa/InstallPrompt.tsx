'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Shows a small install button only when the browser offers the PWA install
// prompt (Chrome/Edge). Rendered next to the theme toggle in the sidebar.
export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!promptEvent) return null;

  const install = async () => {
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  return (
    <button
      type="button"
      onClick={() => void install()}
      title="Install QuickSet"
      aria-label="Install QuickSet"
      className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <Download className="size-4" />
    </button>
  );
}
