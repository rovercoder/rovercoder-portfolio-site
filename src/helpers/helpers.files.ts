export function isFileUrl(path: string | URL) {
    // `path` is neither a string nor a URL -> early return
    if (typeof path !== 'string' && !(path instanceof URL)) {
        return false
    }

    try {
        const url = new URL(path)

        return url.protocol === 'file:'
    } catch (error) {
        return false
    }
}
