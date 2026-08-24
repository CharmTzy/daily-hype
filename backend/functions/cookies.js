const { serialize } = require("cookie");
module.exports.setHttpOnlyCookieHeader = function setHttpOnlyCookieHeader(name, value, res) {
    const cookieValue = serialize(name, value, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production" ? true : false,
        path: "/",
        maxAge: 3600 * 24 * 7,
    });
    res.setHeader("Set-Cookie", cookieValue);
};
module.exports.clearHttpOnlyCookieHeader = function clearHttpOnlyCookieHeader(name, res) {
    res.clearCookie(name, {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
    });
};

