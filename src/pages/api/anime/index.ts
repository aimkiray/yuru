import { NextApiRequest, NextApiResponse } from 'next'
import { Anime } from '@/interfaces/anime'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'GET':
      const animeList = await prisma.anime.findMany({
        include: {
          episode: {
            where: {
              confirmed: false, // Filter episode
            },
          },
          subGroup: true, // Include related 'subGroup' data
        },
      });
      res.status(200).json(animeList)
      break;
    case 'POST':
      // get all confirmed episode id list from request body
      const { confirmedEpisodeIdList } = req.body;
      // update all episode with id in confirmedEpisodeIdList
      await prisma.episode.updateMany({
        where: {
          id: {
            in: confirmedEpisodeIdList,
          },
        },
        data: {
          confirmed: true,
        },
      });
      // delete all episode with id not in confirmedEpisodeIdList
      await prisma.episode.deleteMany({
        where: {
          id: {
            notIn: confirmedEpisodeIdList,
          },
        },
      });
      // if all episode of anime is deleted, delete anime
      await prisma.anime.deleteMany({
        where: {
          episode: {
            none: {},
          },
        },
      });
      // Download all confirmed episode with webtorrent
      


      // return response
      res.status(200).json({ message: 'confirmed' });
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} not allowed`);
  }
}