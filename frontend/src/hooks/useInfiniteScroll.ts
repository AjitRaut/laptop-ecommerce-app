import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
}: UseInfiniteScrollProps) => {
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - threshold
    ) {
      if (hasMore && !isLoading && !isFetching) {
        setIsFetching(true);
      }
    }
  }, [hasMore, isLoading, isFetching, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isFetching && hasMore && !isLoading) {
      onLoadMore();
      setIsFetching(false);
    }
  }, [isFetching, hasMore, isLoading, onLoadMore]);

  return { isFetching };
};