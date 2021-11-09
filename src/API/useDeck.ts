import useSWR from "swr";
import fetcher from "./fetcher";

const useDeck = (): object => {
  const { data, error, mutate } = useSWR(
    "http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1",
    fetcher
  );

  return {
    deck: data,
    deckLoading: !error && !data,
    deckError: error,
    mutateDeck: mutate,
  };
};

export default useDeck;
