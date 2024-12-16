import { createEvent } from "../domain/util";

createEvent("error", async (e) => console.log(e));