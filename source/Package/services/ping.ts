import { DefaultStatusCodes, Package } from "../Main.js";

Package.instance.addService("ping", (request) => {
    request.respond(`pong`, "success", DefaultStatusCodes.NONE);
});