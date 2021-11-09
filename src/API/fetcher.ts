import axios from "axios";

const fetcher = (url: string): object => axios.get(url).then((res) => res.data);

export default fetcher;
