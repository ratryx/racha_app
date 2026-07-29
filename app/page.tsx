'use client';

import {
  useEffect,
  useState,
} from 'react';

import type { PlayerWithCard } from '@/types';
import {
  APP_SECTION_HASHES,
  getSectionFromHash,
  type AppSection,
} from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';

import { GroupAdminModal } from '@/components/admin/GroupAdminModal';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StadiumBackground } from '@/components/dashboard/StadiumBackground';
import { DashboardSectionContent } from '@/components/layout/DashboardSectionContent';
import { AppMenuSheet } from '@/components/navigation/AppMenuSheet';
import { AppNavigation } from '@/components/navigation/AppNavigation';

import { CreatePlayerModal } from '@/components/modals/CreatePlayerModal';
import { EditPlayerModal } from '@/components/modals/EditPlayerModal';
import { PlayerDetailsModal } from '@/components/modals/PlayerDetailsModal';
import { PostMatchModal } from '@/components/modals/PostMatchModal';
import { ResetPinModal } from '@/components/modals/ResetPinModal';

export default function DashboardPage() {
  const {
    user,
    profile,
    loading: authLoading,
    signOut,
  } = useAuth();

  const isAdmin =
    profile?.role === 'admin';

  const dashboard = useDashboardData({
    userId: user?.id ?? null,
    isAdmin,
  });

  const [activeSection, setActiveSection] =
    useState<AppSection>('cards');
  const [selectedPlayer, setSelectedPlayer] =
    useState<PlayerWithCard | null>(null);

  const [menuOpen, setMenuOpen] =
    useState(false);
  const [createOpen, setCreateOpen] =
    useState(false);
  const [editOpen, setEditOpen] =
    useState(false);
  const [matchOpen, setMatchOpen] =
    useState(false);
  const [resetPinOpen, setResetPinOpen] =
    useState(false);
  const [groupAdminOpen, setGroupAdminOpen] =
    useState(false);

  const hasPlayerCard =
    Boolean(dashboard.myPlayer);

  const canEditSelectedPlayer = Boolean(
    user &&
      selectedPlayer?.user_id === user.id
  );

  useEffect(() => {
    function syncFromHash() {
      if (
        window.location.hash === '#groups' &&
        isAdmin
      ) {
        setGroupAdminOpen(true);
        setMenuOpen(false);
        return;
      }

      const section = getSectionFromHash(
        window.location.hash
      );

      if (section) {
        setActiveSection(section);
      }
    }

    syncFromHash();

    window.addEventListener(
      'hashchange',
      syncFromHash
    );

    return () => {
      window.removeEventListener(
        'hashchange',
        syncFromHash
      );
    };
  }, [isAdmin]);

  function navigateTo(
    section: AppSection
  ) {
    setActiveSection(section);
    setMenuOpen(false);

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}${APP_SECTION_HASHES[section]}`
    );
  }

  function openGroupsPanel() {
    setMenuOpen(false);
    setGroupAdminOpen(true);

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#groups`
    );
  }

  function closeGroupsPanel() {
    setGroupAdminOpen(false);

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}${APP_SECTION_HASHES[activeSection]}`
    );
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error(
        'Não foi possível sair:',
        error
      );
    }
  }

  function openPlayerCardEditor() {
    setMenuOpen(false);

    if (hasPlayerCard) {
      setEditOpen(true);
    } else {
      setCreateOpen(true);
    }
  }

  function handleEditFromDetails() {
    if (!canEditSelectedPlayer) {
      return;
    }

    setSelectedPlayer(null);
    setEditOpen(true);
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030605] text-sm font-semibold text-zinc-500">
        Carregando sessão...
      </main>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-transparent text-white">
      <StadiumBackground />

      <DashboardHeader
        currentGroup={
          dashboard.currentGroup
        }
        groups={dashboard.groups}
        isAdmin={isAdmin}
        activeSection={activeSection}
        pendingUsersCount={
          dashboard.pendingUsersCount
        }
        onSelectGroup={
          dashboard.selectGroup
        }
        onNavigate={navigateTo}
        onOpenMenu={() =>
          setMenuOpen(true)
        }
      />

      <DashboardSectionContent
        activeSection={activeSection}
        players={dashboard.players}
        currentGroup={
          dashboard.currentGroup
        }
        loading={dashboard.loading}
        errorMessage={
          dashboard.errorMessage
        }
        isAdmin={isAdmin}
        hasPlayerCard={hasPlayerCard}
        onSelectPlayer={setSelectedPlayer}
        onOpenGroups={openGroupsPanel}
        onOpenCard={openPlayerCardEditor}
        onOpenPostMatch={() =>
          setMatchOpen(true)
        }
      />

      <AppNavigation
        activeSection={activeSection}
        pendingUsersCount={
          dashboard.pendingUsersCount
        }
        onNavigate={navigateTo}
        onOpenMenu={() =>
          setMenuOpen(true)
        }
        variant="mobile"
      />

      <AppMenuSheet
        open={menuOpen}
        profile={profile}
        player={dashboard.myPlayer}
        currentGroup={
          dashboard.currentGroup
        }
        isAdmin={isAdmin}
        pendingUsersCount={
          dashboard.pendingUsersCount
        }
        onClose={() =>
          setMenuOpen(false)
        }
        onOpenPlayerCard={
          openPlayerCardEditor
        }
        onOpenGroups={openGroupsPanel}
        onOpenResetPin={() =>
          setResetPinOpen(true)
        }
        onSignOut={handleSignOut}
      />

      <PlayerDetailsModal
        open={Boolean(selectedPlayer)}
        player={selectedPlayer}
        canEdit={canEditSelectedPlayer}
        onClose={() =>
          setSelectedPlayer(null)
        }
        onEdit={handleEditFromDetails}
      />

      <CreatePlayerModal
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        onCreated={dashboard.reload}
      />

      <EditPlayerModal
        open={editOpen}
        player={dashboard.myPlayer}
        onClose={() =>
          setEditOpen(false)
        }
        onUpdated={dashboard.reload}
      />

      {isAdmin && (
        <>
          <GroupAdminModal
            open={groupAdminOpen}
            groups={dashboard.groups}
            currentGroupId={
              dashboard.currentGroup?.id ??
              null
            }
            onClose={closeGroupsPanel}
            onChanged={dashboard.reload}
            onSelectGroup={
              dashboard.selectGroup
            }
          />

          <PostMatchModal
            open={matchOpen}
            players={dashboard.players}
            onClose={() =>
              setMatchOpen(false)
            }
            onSaved={dashboard.reload}
          />

          <ResetPinModal
            open={resetPinOpen}
            onClose={() =>
              setResetPinOpen(false)
            }
          />
        </>
      )}
    </main>
  );
}
