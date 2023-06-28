import { objInstance } from "../helpers/helper.js";
export const logURLAndMethods = (req, res, next) => {
    objInstance.pushIn({ mtd: req.method, url: req.url });
    next();
};
//# sourceMappingURL=urlLogger.js.map