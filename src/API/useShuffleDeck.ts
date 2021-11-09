import useSWR from "swr";
import fetcher from "./fetcher";

const useShuffleDeck = (deck_id: string): object => {
  const { data, error, mutate } = useSWR(
    `http://deckofcardsapi.com/api/deck/${deck_id}/shuffle/`,
    fetcher
  );

  return {
    shuffleDeck: data,
    shuffleDeckLoading: !error && !data,
    shuffleDeckError: error,
    mutateShuffleDeck: mutate,
  };
};

export default useShuffleDeck;
