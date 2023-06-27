import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { query, method } = req
  const id = parseInt(query.id as string, 10)

  switch (method) {
    case 'DELETE':
      const filter = await prisma.filter.findUnique({ where: { id } });

      if (!filter) {
        res.status(404).json({ id, message: 'Filter not found' });
        return;
      }

      await prisma.filter.delete({ where: { id } });
      res.status(200).json({ id, message: 'Filter deleted successfully' });
      break;
    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
