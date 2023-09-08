import client from '@/lib/webtorrent'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Torrent } from 'webtorrent'
import prisma from '@/lib/prisma'

export const config = {
  api: {
    responseLimit: false,
  },
}

// Download torrent
const downloadTorrent = async (torrentId: string, path: string) => {
  return new Promise<Torrent>((resolve) => {
    client.add(
      torrentId,
      {
        path: path,
        destroyStoreOnDestroy: true,
        strategy: 'sequential'
      },
      (torrent: Torrent) => {
        resolve(torrent)
      }
    )
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const episodeId = parseInt(req.query.id as string, 10)
  const torrentQuery = await prisma.episode.findUnique({
    where: {
      id: episodeId
    },
    select: {
      name: true,
      torrent: true,
      infoHash: true,
      // anime: true
    }
  })
  const torrentId = torrentQuery.torrent

  if (!torrentId) {
    return res.status(400).json({ error: 'Episode without magnet' })
  }

  const existingTorrent = await client.get(torrentId)
  if (existingTorrent) {
    return streamTorrent(existingTorrent, req, res)
    // const file = existingTorrent?.files?.find((file) => file.name.endsWith('.mkv') || file.name.endsWith('.mp4'))
    // if (!file) {
    //   client.remove(existingTorrent)
    // } else {
    //   return streamTorrent(existingTorrent, req, res)
    // }
  }

  const newTorrent = await downloadTorrent(torrentId, path.resolve(process.cwd(), 'torrents'))

  if (!newTorrent) {
    return res.status(400).json({ error: 'Error adding torrent' })
  }

  // update infoHash
  await prisma.episode.update({
    where: {
      id: episodeId
    },
    data: {
      infoHash: newTorrent.infoHash
    }
  })

  const torrentIsReady = await waitForTorrent(newTorrent);

  if (!torrentIsReady) {
    return res.status(400).json({ error: 'Torrent not ready for streaming' })
  }

  streamTorrent(newTorrent, req, res)
}

// Wait for torrent to be ready
async function waitForTorrent(newTorrent, timeout = 60) {
  for (let i = 0; i < timeout; i++) {
    if (newTorrent.files.length > 0 && newTorrent.ready) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

// Stream torrent
const streamTorrent = (torrent: Torrent, req: NextApiRequest, res: NextApiResponse) => {
  const file = torrent.files.find(file => file.name.endsWith('.mkv') || file.name.endsWith('.mp4'))

  if (!file) {
    return res.status(400).json({ error: 'No video files found' })
  }

  const fileSize = file.length
  const range = req.headers.range
  const contentType = file.name.endsWith('.mkv') ? 'video/x-matroska' : 'video/mp4'

  // Check if range exists
  if (range) {
    // Extract the start from the range string and convert to number
    const start = Number(range.replace(/\D/g, ''));

    // Determine the end based on the start and file size
    const end = Math.min(start + 10 ** 6, fileSize - 1);

    // If start or end is greater than or equal to file size, return an error
    if (start >= fileSize || end >= fileSize) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`
      });
      return res.end();
    }

    // Set response headers for partial content
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType
    });

    // Create a read stream for the specified range and pipe to response
    const readStream = file.createReadStream({ start, end });
    readStream.pipe(res);

  } else {
    // If no range, set response headers for full content
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType
    });

    // Create a read stream for the full file and pipe to response
    const readStream = file.createReadStream();
    readStream.pipe(res);
  }
}
