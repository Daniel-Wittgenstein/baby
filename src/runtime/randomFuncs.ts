
export function getRndInt(from: number, to: number) {
    from = Math.ceil(from)
    to = Math.floor(to)
    return Math.floor( Math.random() * (to - from + 1) ) + from
}
