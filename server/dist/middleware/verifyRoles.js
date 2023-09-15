export function verifyRoles(roles) {
    return (req, res, next) => {
        if (!roles.length)
            return res.sendStatus(403);
        const userRole = req.roles;
        const allowedRoles = roles.map(role => userRole.includes(role)).find(res => res == true);
        if (!allowedRoles)
            return res.sendStatus(403);
        next();
    };
}
//# sourceMappingURL=verifyRoles.js.map