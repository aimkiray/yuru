import client from '@/lib/webtorrent'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Torrent } from 'webtorrent'
import prisma from '@/lib/prisma'

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { query, method } = req
  const episodeId = parseInt(query.id as string, 10)

  switch (method) {
    case 'GET':
      // Get magnet data from database
      const torrentQuery = await prisma.episode.findUnique({
        where: {
          id: episodeId
        },
        select: {
          name: true,
          torrent: true,
          anime: true
        }
      })
      if (!torrentQuery) { res.status(200).json({ message: 'Episode not found' }); break; }
      const torrentId = torrentQuery.torrent
      const existingTorrent = await client.get(torrentId)
      if (existingTorrent) {
        const torrentStatus = { progress: existingTorrent.progress, name: existingTorrent.name, infoHash: existingTorrent.infoHash, id: episodeId }
        res.status(200).json({ torrentStatus, message: 'success' })
      } else {
        res.status(200).json({ message: 'failed' })
      }
      break
    case 'PUT':
      const updateEpisode = req.body;
      // Update anime in database
      res.status(200).json({ message: 'success' })
      break
    case 'DELETE':
      // Delete anime from database
      res.status(200).json({ message: 'success' })
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} not allowed`)
  }
}
