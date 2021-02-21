export function trimEndSlashes(url: string) {
    return url.replace(/\/+$/, "");
}

export function getTokenFromHeaders(authorization: string) {
    if (authorization && authorization.length > 7)
        return authorization.slice(7); // slicing 'Bearer ' from the header
}