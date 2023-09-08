import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { query, method } = req
  const id = parseInt(query.id as string, 10)

  switch (method) {
    case 'GET':
      // Get anime data from database
      const anime = await prisma.anime.findUnique({
        where: {
          id: id
        },
      });
      res.status(200).json({ anime, message: 'success' })
      break
    case 'PUT':
      const updateEpisode = req.body;
      // Update anime in database
      const animeUpdated = await prisma.anime.update({
        where: {
          id: id
        },
        data: updateEpisode
      });
      res.status(200).json({ animeUpdated, message: 'success' })
      break
    case 'DELETE':
      // Find anime
      const animeToDelete = await prisma.anime.findUnique({
        include: {
          episode: true
        },
        where: {
          id: id
        },
      });
      // Delete all episode related to anime
      for (const episode of animeToDelete.episode) {
        await prisma.episode.delete({
          where: {
            id: episode.id
          }
        });
      }
      // Delete anime
      await prisma.anime.delete({
        where: {
          id: id
        }
      });
      res.status(200).json({ message: 'success' })
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} not allowed`)
  }
}
