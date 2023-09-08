import WebTorrent from 'webtorrent-hybrid'

const client = new WebTorrent();

client.setMaxListeners(100);

export default client;