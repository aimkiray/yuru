import { client } from '@/lib/webtorrent'
import { Torrent } from 'webtorrent'
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { query, method } = req
  switch (method) {
    case 'GET':
      const torrentList = client.torrents.map((torrent: Torrent) => {
        return {
          name: torrent.name,
          magnetURI: torrent.magnetURI
        }
      })
      res.status(200).json(torrentList);
      break;
    case 'DELETE':
      try {
        for (const torrent of client.torrents) {
          client.remove(torrent)
          torrent.destroy({}, () => {
            torrent.files.forEach((file) => {
              console.log(file.path)
              fs.unlinkSync(file.path)
            })
            fs.rmdirSync(torrent.path)
          })
        }

        res.status(200).json({ success: true })
      } catch (e) {
        res.status(500).json({ error: e.message })
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'DELETE'])
      res.status(405).end(`Method ${method} not allowed`)
  }
}