import React, { useState, useEffect, useCallback } from "react";
import SearchModal from "./SearchModal";
import FileExplorer, { type FileNode } from "./FileExplorer";
import QuizModal from "./QuizModal";
import InfoModal from "./InfoModal";
import DonateModal from "./DonateModal";
import SocialModals, { type SocialModalType } from "./SocialModals";

export interface ModalEventDetail {
  modal: "search" | "info" | "donate" | "quiz" | "quizzes" | "reddit" | "discord" | "explorer" | "file-explorer";
  initialPath?: string;
  initialData?: "cisce" | "study";
  dataType?: "cisce" | "study";
  data?: FileNode;
}

interface ExplorerState {
  open: boolean;
  dataType?: "cisce" | "study" | null;
  initialPath?: string;
  data?: FileNode | null;
}

/**
 * APP MODALS MASTER COORDINATOR ISLAND
 * Hydrated via client:idle on the root layout.
 * Listens for global 'app:open-modal' CustomEvents and 'Ctrl+K' / 'Cmd+K' shortcuts,
 * and orchestrates the presentation of all client dialogs with lazy asset hydration.
 */
export const AppModals: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [socialModal, setSocialModal] = useState<SocialModalType>(null);
  const [explorerState, setExplorerState] = useState<ExplorerState>({
    open: false,
    dataType: null,
    initialPath: undefined,
    data: null,
  });

  // Handler for custom modal trigger events
  const handleOpenModal = useCallback((e: Event) => {
    const customEvent = e as CustomEvent<ModalEventDetail>;
    const detail = customEvent.detail;
    if (!detail) return;

    const modal = detail.modal;
    switch (modal) {
      case "search":
        setSearchOpen(true);
        break;
      case "quiz":
      case "quizzes":
        setQuizOpen(true);
        break;
      case "info":
        setInfoOpen(true);
        break;
      case "donate":
        setDonateOpen(true);
        break;
      case "reddit":
        setSocialModal("reddit");
        break;
      case "discord":
        setSocialModal("discord");
        break;
      case "explorer":
      case "file-explorer":
        setExplorerState({
          open: true,
          dataType: detail.initialData || detail.dataType || "study",
          initialPath: detail.initialPath,
          data: detail.data || null,
        });
        break;
      default:
        console.warn("Unknown modal requested in app:open-modal:", modal);
    }
  }, []);

  // Handlers for specific convenience events
  const handleOpenSearch = useCallback(() => setSearchOpen(true), []);
  const handleOpenQuiz = useCallback(() => setQuizOpen(true), []);
  const handleOpenInfo = useCallback(() => setInfoOpen(true), []);
  const handleOpenDonate = useCallback(() => setDonateOpen(true), []);
  const handleOpenExplorer = useCallback((e: Event) => {
    const customEvent = e as CustomEvent<{ type?: "study" | "cisce"; path?: string; data?: FileNode }>;
    setExplorerState({
      open: true,
      dataType: customEvent.detail?.type || "study",
      initialPath: customEvent.detail?.path,
      data: customEvent.detail?.data || null,
    });
  }, []);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    // Register event listeners on window
    window.addEventListener("app:open-modal", handleOpenModal);
    window.addEventListener("open-modal", handleOpenModal);
    window.addEventListener("open-search", handleOpenSearch);
    window.addEventListener("open-quiz", handleOpenQuiz);
    window.addEventListener("open-info", handleOpenInfo);
    window.addEventListener("open-donate", handleOpenDonate);
    window.addEventListener("open-explorer", handleOpenExplorer);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("app:open-modal", handleOpenModal);
      window.removeEventListener("open-modal", handleOpenModal);
      window.removeEventListener("open-search", handleOpenSearch);
      window.removeEventListener("open-quiz", handleOpenQuiz);
      window.removeEventListener("open-info", handleOpenInfo);
      window.removeEventListener("open-donate", handleOpenDonate);
      window.removeEventListener("open-explorer", handleOpenExplorer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleOpenModal,
    handleOpenSearch,
    handleOpenQuiz,
    handleOpenInfo,
    handleOpenDonate,
    handleOpenExplorer,
    handleKeyDown,
  ]);

  return (
    <div id="app-modals-root" data-testid="app-modals-root">
      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* File Explorer Modal */}
      {explorerState.open && (
        <FileExplorer
          open={explorerState.open}
          dataType={explorerState.dataType}
          data={explorerState.data}
          initialPath={explorerState.initialPath}
          onClose={() => setExplorerState({ open: false, dataType: null, initialPath: undefined, data: null })}
        />
      )}

      {/* Quiz Modal */}
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />

      {/* Info Modal */}
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />

      {/* Donate Modal */}
      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} />

      {/* Social Communities Modals (Reddit & Discord) */}
      <SocialModals activeModal={socialModal} onClose={() => setSocialModal(null)} />
    </div>
  );
};

export default AppModals;
