import client from '@/lib/webtorrent'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const torrents = client.torrents.map((torrent) => {
    return {
      name: torrent.name,
      magnetURI: torrent.magnetURI
    }
  })

  res.status(200).json(torrents ?? [])
}

