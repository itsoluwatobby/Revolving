export function verifyRoles(roles) {
    return (req, res, next) => {
        var _a;
        if (!roles.length)
            return res.sendStatus(403);
        const userRole = req.roles;
        const allowedRoles = (_a = roles.map(role => userRole === null || userRole === void 0 ? void 0 : userRole.includes(role))) === null || _a === void 0 ? void 0 : _a.find(res => res == true);
        if (!allowedRoles)
            return res.sendStatus(403);
        next();
    };
}
//# sourceMappingURL=verifyRoles.js.map