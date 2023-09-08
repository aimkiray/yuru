import client from '@/lib/webtorrent'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Torrent } from 'webtorrent'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // const episodeList = await prisma.episode.findMany({
  //   where: {
  //     confirmed: true,
  //   },
  //   select: {
  //     id: true,
  //     torrent: true,
  //     description: true,
  //   }
  // })
  const animeList = await prisma.anime.findMany({
    where: {
      episode: {
        some: {
          confirmed: true, // Filter episode
          downloaded: false
        },
      },
    },
    include: {
      episode: true,
      subGroup: true, // Include related 'subGroup' data
    },
  });

  if (animeList) {
    animeList.forEach(async (anime) => {
      const downloadPath = path.resolve(process.cwd(), 'torrents', anime.name)
      anime.episode.forEach(async (episode) => {
        const torrentId = episode.torrent
        const existingTorrent = await client.get(torrentId)
        if (existingTorrent) {
          return
        }
        const torrent = await new Promise<Torrent>((resolve) => {
          client.add(
            torrentId,
            {
              path: downloadPath,
              destroyStoreOnDestroy: true,
              strategy: 'sequential'
            },
            (torrent: Torrent) => {
              resolve(torrent)
            }
          )
        })
        torrent.on('done', async () => {
          const filePath = torrent.files[0].path
          console.log(filePath + ' download finished')
          try {
            await prisma.episode.update({
              where: {
                id: episode.id
              },
              data: {
                downloaded: true,
                filePath: filePath
              }
            })
          } catch (err) {
            console.error('Error updating database:', err)
          }
        })
      })
    })
  }
  res.status(200).json({ message: "Torrents are being downloaded." });
}