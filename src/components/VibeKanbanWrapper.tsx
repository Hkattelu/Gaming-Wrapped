"use client";

import dynamic from 'next/dynamic';

const VibeKanbanWebCompanion = dynamic(
  () => import('vibe-kanban-web-companion').then(mod => mod.VibeKanbanWebCompanion),
  { ssr: false }
);

export function VibeKanbanWrapper() {
  return <VibeKanbanWebCompanion />;
}
