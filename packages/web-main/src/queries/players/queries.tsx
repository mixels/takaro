import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useApiClient } from 'hooks/useApiClient';
import { PlayerOutputArrayDTOAPI, PlayerOutputDTO, PlayerOutputDTOAPI, PlayerSearchInputDTO } from '@takaro/apiclient';
import { hasNextPage } from '../util';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';

export const playerKeys = {
  all: ['players'] as const,
  list: () => [...playerKeys.all, 'list'] as const,
  detail: (id: string) => [...playerKeys.all, 'detail', id] as const,
};

export const usePlayers = ({ page = 0, ...playerSearchInputArgs }: PlayerSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<PlayerOutputArrayDTOAPI, AxiosError<PlayerOutputArrayDTOAPI>>({
    queryKey: playerKeys.list(),
    queryFn: async ({ pageParam = page }) =>
      (
        await apiClient.player.playerControllerSearch({
          ...playerSearchInputArgs,
          page: pageParam,
        })
      ).data,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
    useErrorBoundary: (error) => error.response!.status >= 500,
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};

export const usePlayer = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<PlayerOutputDTO, AxiosError<PlayerOutputDTOAPI>>({
    queryKey: playerKeys.detail(id),
    queryFn: async () => (await apiClient.player.playerControllerGetOne(id)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};