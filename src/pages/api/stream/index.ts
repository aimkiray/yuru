import client from '@/lib/webtorrent'
import { Torrent } from 'webtorrent'
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import prisma from '@/lib/prisma'
import logger from '@/lib/logger'

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
        // for (const torrent of client.torrents) {
        //   client.remove(torrent)
        //   torrent.destroy({}, () => {
        //     torrent.files.forEach((file) => {
        //       console.log(file.path)
        //       fs.unlinkSync(file.path)
        //     })
        //     fs.rmdirSync(torrent.path)
        //   })
        // }
        const episodeNotConfirmed = await prisma.episode.findMany({
          where: {
            confirmed: false,
            previewed: true,
          },
          select: {
            id: true,
            torrent: true,
            infoHash: true,
          }
        })
        let count = 0
        if (episodeNotConfirmed) {
          episodeNotConfirmed.forEach((episode) => {
            if (episode.infoHash) {
              count++
            }
            const isExist = client.get(episode.torrent)
            const isExistTorrent = client
            if (isExist) {
              client.remove(isExist)
              // delete torrent file
              isExist.destroy({}, () => {
                isExist.files.forEach((file) => {
                  logger.info(file.path)
                  fs.unlinkSync(file.path)
                })
                fs.rmdirSync(isExist.path)
              })
              count--
            }
          })
        }
        if (count !== 0) res.status(404).json({ message: `Cache not fully deleted` })
        res.status(200).json({ message: `${count} torrents deleted` })
      } catch (e) {
        res.status(500).json({ message: e.message })
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'DELETE'])
      res.status(405).end(`Method ${method} not allowed`)
  }
}