import type { NextApiRequest, NextApiResponse } from 'next'
import type { Episode } from '@/interfaces/anime'
import prisma from '@/lib/prisma'

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { query, method } = req
  const id = parseInt(query.id as string, 10)

  switch (method) {
    case 'GET':
      // Get data from your database
      res.status(200).json({ })
      break
    case 'PUT':
      const updateEpisode = req.body;
      // Update episode in database
      const result = await prisma.episode.update({
        where: { id: id },
        data: updateEpisode,
      })
      res.status(200).json({ message: 'updated'})
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} not allowed`)
  }
}
