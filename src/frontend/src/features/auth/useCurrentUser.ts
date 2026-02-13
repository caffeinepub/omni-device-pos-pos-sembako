import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { UserProfile } from '../../backend';

export function useCurrentUser() {
  const { actor, isFetching: actorFetching } = useActor();

  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  const roleQuery = useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    userProfile: profileQuery.data,
    isAdmin: roleQuery.data === true,
    isLoading: actorFetching || profileQuery.isLoading || roleQuery.isLoading,
    isFetched: !!actor && profileQuery.isFetched,
  };
}
