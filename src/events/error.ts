import { createEvent } from "../service/types";

export default createEvent("error", async (e) => console.log(e));