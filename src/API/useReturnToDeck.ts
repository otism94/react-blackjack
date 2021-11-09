import useSWR from "swr";
import fetcher from "./fetcher";

const useReturnToDeck = (deck_id: string, pile_name: string): object => {
  const { data, error, mutate } = useSWR(
    `http://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile_name}/return/`,
    fetcher
  );

  return {
    returnToDeck: data,
    returnToDeckLoading: !error && !data,
    returnToDeckError: error,
    mutateReturnToDeck: mutate,
  };
};

export default useReturnToDeck;
