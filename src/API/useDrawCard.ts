import useSWR from "swr";
import fetcher from "./fetcher";

const useDrawCard = (deck_id: string, count: number = 1): object => {
  const { data, error, mutate } = useSWR(
    `http://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${count}`,
    fetcher
  );

  return {
    drawCard: data,
    drawCardLoading: !error && !data,
    drawCardError: error,
    mutateCard: mutate,
  };
};

export default useDrawCard;
