import WebTorrent from 'webtorrent-hybrid'

export const client = new WebTorrent()

client.setMaxListeners(100)