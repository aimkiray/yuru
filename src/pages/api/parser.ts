import { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';
import xml2js from "xml2js";
import * as cheerio from 'cheerio';
import parseTorrent, { toMagnetURI } from 'parse-torrent';
import prisma from '../../lib/prisma';
import { HttpProxyAgent } from 'http-proxy-agent';
import { Anime, Episode, SubGroup } from '@/interfaces/anime';

// Configure your HTTP proxy here
const proxy = "http://127.0.0.1:7890";
const agent = new HttpProxyAgent(proxy);

const mikanBaseUrl = 'https://mikanani.me';
const mikanAnimeUrl = `${mikanBaseUrl}/Home/Bangumi/`;
const bgmBaseUrl = 'https://bgm.tv';
const bgmAnimeUrl = `${bgmBaseUrl}/subject/`;

async function fetchAnimeWithXML(url: string): Promise<Episode[]> {
  try {
    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Referer': url
      }
    });
    const xml = response.data;

    const parser = new xml2js.Parser();
    const parsedXml = await parser.parseStringPromise(xml);
    const items = parsedXml.rss.channel[0].item;

    const result = await Promise.all(
      items.map(async (item: any) => {
        const torrent = item.enclosure[0].$.url;
        const torrentBuffer = await axios.get(torrent, { responseType: 'arraybuffer' });
        const parsedTorrent = await parseTorrent(torrentBuffer.data);
        const magnetURI = toMagnetURI(parsedTorrent);

        return {
          link: item.link[0],
          description: item.description[0],
          pubDate: item.torrent[0].pubDate[0],
          torrent: magnetURI
        };
      })
    );
    return result;
  } catch (error) {
    console.error(error);
  }
}

// https://mikanani.me/Home/Episode/
async function getAnimeInfoFromMikanEpisode(url: string): Promise<Anime> {
  try {
    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Referer': url
      }
    });
    const pageSource = response.data;

    let $ = cheerio.load(pageSource);
    // background-image: url('/images/Bangumi/202304/24335806.jpg');
    const img = $('.bangumi-poster.div-hover').attr('style')?.split("'")[1];

    const animeLink = $('.bangumi-title a').attr('href')!.split('/').pop();
    const sourceId = animeLink!.split('#')[0];
    const publishGroupId = animeLink!.split('#')[1];
    let publishGroupName = $('.magnet-link-wrap span').text();
    const name = $('.bangumi-title a').text();

    let subGroupList: SubGroup[] = [];

    $('.material-dropdown-menu li a').each((_, element) => {
      const subGroup: SubGroup = {
        sourceId: $(element).attr('href')!.split('/').pop()!,
        name: $(element).text()!
      };
      subGroupList.push(subGroup);
    });

    if (subGroupList.length === 0) {
      const subGroup: SubGroup = {
        sourceId: $('.bangumi-info a').attr('href')!.split('/').pop()!,
        name: $('.bangumi-info a').text()!
      };
      subGroupList.push(subGroup);
      publishGroupName = subGroup.name;
    }

    return {
      sourceSite: 'mikan',
      sourceId: sourceId,
      name: name!,
      img: img!,
      publishGroupId: publishGroupId,
      publishGroupName: publishGroupName!,
      subGroup: subGroupList,
    }
  } catch (error) {
    console.error(error);
  }
}

// https://mikanani.me/Home/Bangumi/:sourceId
async function getBGMIdFromMikanAnime(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Referer': url
      }
    });
    const pageSource = response.data;

    const regex = /https?:\/\/bgm\.tv\/subject\/\d+/g;
    const match = pageSource.match(regex);
    const bgmId = match![0].split('/').pop()!;

    return bgmId;
  } catch (error) {
    console.error(error);
  }
}

// format bgm custom date string to en-US format
function formatDate(dateString: string): string {
  const dateParts = dateString.split(/年|月|日/).map(part => parseInt(part, 10));
  const dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

  const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

  return dateObject.toLocaleDateString('en-US', options);
}

// https://bgm.tv/subject/:bgmId
async function getAnimeInfoFromBGM(url: string): Promise<{}> {
  try {
    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Referer': url
      }
    });
    const pageSource = response.data;

    let $ = cheerio.load(pageSource);

    // Get the title
    const title = $('h1.nameSingle a').text();

    // Initialize an empty array to hold the info
    const info = [];

    // Get the info
    $('#infobox li').each((i, element) => {
      const item = {};
      const tip = $(element).find('.tip').text().trim().slice(0, -1); // Remove the trailing colon
      const value = $(element).contents().not('.tip').text().trim(); // Get the text that's not part of .tip
      item[tip] = value;
      info.push(item);
    });

    const count = info.find(item => '话数' in item)?.话数;
    const startDate = info.find(item => '放送开始' in item)?.放送开始;
    const dayOfWeek = info.find(item => '放送星期' in item)?.放送星期;
    const nameAlias = info.find(item => '别名' in item)?.别名;

    return {
      nameRaw: title,
      nameAlias: nameAlias,
      count: count,
      startDate: formatDate(startDate),
      dayOfWeek: dayOfWeek,
    }
  } catch (error) {
    console.error(error);
  }
}

// GET /api/rssParser?token=:token or /api/rssParser?bangumiId=:bangumiId&subgroupid=:subgroupid
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
  // 'banguimiId' has been renamed to 'sourceId' in this project.
  // 'subgroupId' has been renamed to 'publishGroupId' in this project and may contain multiple subGroups.
  const { token, bangumiId, subgroupid } = req.query;
  let url = ''
  if (token) {
    url = `${mikanBaseUrl}/RSS/MyBangumi?token=${token}`
  } else if (bangumiId && subgroupid) {
    url = `${mikanBaseUrl}/RSS/Bangumi?bangumiId=${bangumiId}&subgroupid=${subgroupid}`
  } else {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  let byPrisma: any[] = [];

  try {
    // mikan
    const animeTempList = await fetchAnimeWithXML(url);
    let animeCollection: any[] = [];
    let animeList: any[] = [];
    if (token && !animeList.length) {
      for (let anime of animeTempList) {
        // Get anime related information.
        const result = await getAnimeInfoFromMikanEpisode(anime.link);
        if (result) {
          // Check for duplication.
          if (animeCollection.some(obj => obj.sourceId === result.sourceId)) {
            continue;
          }
          url = `${mikanBaseUrl}/RSS/Bangumi?bangumiId=${result.sourceId}&subgroupid=${result.publishGroupId}`
          animeList = await fetchAnimeWithXML(url)
          result.episode = animeList;
          animeCollection.push(result);
        }
      }
    } else if (subgroupid && bangumiId && !animeList.length) {
      const result = await getAnimeInfoFromMikanEpisode(animeTempList[0].link);
      if (result) {
        result.episode = animeTempList;
        animeCollection.push(result);
      }
    } else {
      res.status(200).json({ info: "Invalid RSS feed or empty content." });
    }

    // bgm
    animeCollection = await Promise.all(animeCollection.map(async (animeData) => {
      const bgmId = await getBGMIdFromMikanAnime(mikanAnimeUrl + animeData.sourceId);
      const result = await getAnimeInfoFromBGM(bgmAnimeUrl + bgmId);
      if (result) {
        return {
          ...animeData,
          nameRaw: result['nameRaw'],
          nameAlias: result['nameAlias'],
          count: result['count'],
          startDate: result['startDate'],
          dayOfWeek: result['dayOfWeek'],
          bgmId: bgmId,
        };
      }
      return animeData;
    }));

    for (let animeData of animeCollection) {
      const { subGroup, episode, ...pureAnime } = animeData;

      const existingAnime = await prisma.anime.findUnique({
        where: {
          sourceId: pureAnime.sourceId,
        },
      });

      if (!existingAnime) {
        const result = await prisma.anime.create({
          data: {
            ...pureAnime,
            subGroup: {
              connectOrCreate: subGroup.map((subGroupItem: SubGroup) => ({
                where: { sourceId: subGroupItem.sourceId },
                create: subGroupItem,
              })),
            },
            episode: {
              connectOrCreate: episode.map((episodeItem: Episode) => ({
                where: { link: episodeItem.link },
                create: episodeItem,
              })),
            },
          },
        })
        byPrisma.push(result)
      }
    }
    const animeWithId = await prisma.anime.findMany({
      include: {
        episode: {
          where: {
            confirmed: false, // Filter episode
          },
        },
        subGroup: true, // Include related 'subGroup' data
      },
    });
    res.status(200).json(animeWithId)
  } catch (error) {
    res.status(500).json({ data: byPrisma, error: error });
  }
};