import useSWR from "swr";
import fetcher from "./fetcher";

const useAddToHand = (
  deck_id: string,
  pile_name: string,
  cards: string[]
): object => {
  const { data, error, mutate } = useSWR(
    `http://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile_name}/add/?cards=${cards.join(
      ","
    )}`,
    fetcher
  );

  return {
    addToHand: data,
    addToHandLoading: !error && !data,
    addToHandError: error,
    mutateAddToHand: mutate,
  };
};

export default useAddToHand;
