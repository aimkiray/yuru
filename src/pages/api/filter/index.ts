import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  switch (req.method) {
    case 'GET':
      const filterList = await prisma.filter.findMany();
      res.status(200).json({ data: filterList });
      break;
    case 'POST':
      const { text } = req.body;
      const existingFilter = await prisma.filter.findUnique({
        where: {
          text,
        },
      });
      if (existingFilter) {
        res.status(409).json({ message: `Filter with text "${text}" already exists` });
        return;
      }
      await prisma.filter.create({
        data: {
          text,
        },
      });
      res.status(200).json({ message: 'Filter added successfully' });
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} not allowed`);
  }
}