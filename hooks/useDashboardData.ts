'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import type {
  AdminUserOverview,
  Group,
  Player,
  PlayerWithCard,
} from '@/types';
import {
  getAdminUsers,
  getGroups,
  getMyGroupMembership,
  getMyPlayer,
  getPlayersWithCards,
} from '@/lib/supabase/queries';

interface UseDashboardDataInput {
  userId: string | null;
  isAdmin: boolean;
}

export function useDashboardData({
  userId,
  isAdmin,
}: UseDashboardDataInput) {
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
  const [pendingUsersCount, setPendingUsersCount] =
    useState(0);
  const [loading, setLoading] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState('');

  const reload = useCallback(async () => {
    if (!userId) {
      setPlayers([]);
      setMyPlayer(null);
      setGroups([]);
      setCurrentGroup(null);
      setPendingUsersCount(0);
      setErrorMessage('');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const [
        currentPlayer,
        membership,
        availableGroups,
        adminUsers,
      ] = await Promise.all([
        getMyPlayer(),
        getMyGroupMembership(),
        isAdmin
          ? getGroups()
          : Promise.resolve([] as Group[]),
        isAdmin
          ? getAdminUsers()
          : Promise.resolve(
              [] as AdminUserOverview[]
            ),
      ]);

      const memberGroup =
        membership?.group ?? null;

      let nextGroup = memberGroup;

      if (isAdmin) {
        setGroups(availableGroups);
        setPendingUsersCount(
          adminUsers.filter(
            (adminUser) =>
              adminUser.group_id === null
          ).length
        );

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
        setPendingUsersCount(0);
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
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os dados.'
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userId, viewedGroupId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    players,
    myPlayer,
    groups,
    currentGroup,
    pendingUsersCount,
    loading,
    errorMessage,
    reload,
    selectGroup: setViewedGroupId,
  };
}
