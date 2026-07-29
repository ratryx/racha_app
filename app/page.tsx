'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import type {
  Group,
  Player,
  PlayerWithCard,
} from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  getGroups,
  getMyGroupMembership,
  getMyPlayer,
  getPlayersWithCards,
} from '@/lib/supabase/queries';

import { LoginScreen } from '@/components/auth/LoginScreen';
import { GroupAdminModal } from '@/components/admin/GroupAdminModal';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StadiumBackground } from '@/components/dashboard/StadiumBackground';

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

  const [players, setPlayers] =
    useState<PlayerWithCard[]>([]);
  const [myPlayer, setMyPlayer] =
    useState<Player | null>(null);
  const [groups, setGroups] =
    useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] =
    useState<Group | null>(null);
  const [viewedGroupId, setViewedGroupId] =
    useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] =
    useState<PlayerWithCard | null>(null);

  const [dashboardLoading, setDashboardLoading] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState('');

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

  const isAdmin = profile?.role === 'admin';
  const hasPlayerCard = Boolean(myPlayer);
  const canEditSelectedPlayer = Boolean(
    user &&
      selectedPlayer?.user_id === user.id
  );

  const loadDashboard = useCallback(async () => {
    if (!user) {
      setPlayers([]);
      setMyPlayer(null);
      setGroups([]);
      setCurrentGroup(null);
      setSelectedPlayer(null);
      return;
    }

    setDashboardLoading(true);
    setErrorMessage('');

    try {
      const [
        currentPlayer,
        membership,
        availableGroups,
      ] = await Promise.all([
        getMyPlayer(),
        getMyGroupMembership(),
        isAdmin
          ? getGroups()
          : Promise.resolve([] as Group[]),
      ]);

      const memberGroup =
        membership?.group ?? null;

      let nextGroup = memberGroup;

      if (isAdmin) {
        setGroups(availableGroups);

        const requestedGroup =
          viewedGroupId
            ? availableGroups.find(
                (group) =>
                  group.id === viewedGroupId
              ) ?? null
            : null;

        nextGroup =
          requestedGroup ??
          memberGroup ??
          availableGroups[0] ??
          null;
      } else {
        setGroups(
          memberGroup ? [memberGroup] : []
        );
      }

      const playerList = nextGroup
        ? await getPlayersWithCards(
            nextGroup.id
          )
        : [];

      setMyPlayer(currentPlayer);
      setCurrentGroup(nextGroup);
      setPlayers(playerList);

      if (
        isAdmin &&
        nextGroup &&
        nextGroup.id !== viewedGroupId
      ) {
        setViewedGroupId(nextGroup.id);
      }

      setSelectedPlayer(
        (currentSelectedPlayer) => {
          if (!currentSelectedPlayer) {
            return null;
          }

          return (
            playerList.find(
              (player) =>
                player.id ===
                currentSelectedPlayer.id
            ) ?? null
          );
        }
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o elenco.'
      );
    } finally {
      setDashboardLoading(false);
    }
  }, [isAdmin, user, viewedGroupId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleSignOut() {
    setErrorMessage('');

    try {
      await signOut();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível sair.'
      );
    }
  }

  function openPlayerCardEditor() {
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
        currentGroup={currentGroup}
        groups={groups}
        isAdmin={isAdmin}
        hasPlayerCard={hasPlayerCard}
        onSelectGroup={setViewedGroupId}
        onSignOut={handleSignOut}
        onOpenGroups={() =>
          setGroupAdminOpen(true)
        }
        onOpenResetPin={() =>
          setResetPinOpen(true)
        }
        onOpenPostMatch={() =>
          setMatchOpen(true)
        }
        onOpenPlayerCard={
          openPlayerCardEditor
        }
      />

      <DashboardContent
        players={players}
        currentGroup={currentGroup}
        loading={dashboardLoading}
        errorMessage={errorMessage}
        isAdmin={isAdmin}
        hasPlayerCard={hasPlayerCard}
        onSelectPlayer={setSelectedPlayer}
        onOpenGroups={() =>
          setGroupAdminOpen(true)
        }
        onOpenCard={openPlayerCardEditor}
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
        onClose={() => setCreateOpen(false)}
        onCreated={loadDashboard}
      />

      <EditPlayerModal
        open={editOpen}
        player={myPlayer}
        onClose={() => setEditOpen(false)}
        onUpdated={loadDashboard}
      />

      {isAdmin && (
        <>
          <GroupAdminModal
            open={groupAdminOpen}
            groups={groups}
            currentGroupId={
              currentGroup?.id ?? null
            }
            onClose={() =>
              setGroupAdminOpen(false)
            }
            onChanged={loadDashboard}
            onSelectGroup={setViewedGroupId}
          />

          <PostMatchModal
            open={matchOpen}
            players={players}
            onClose={() =>
              setMatchOpen(false)
            }
            onSaved={loadDashboard}
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
