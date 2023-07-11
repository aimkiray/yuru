import React, { useState, useRef, useEffect, use } from 'react'
import axios from 'axios';
import { Anime, Episode } from '@/interfaces/anime';
// import dynamic from 'next/dynamic'
// const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
//   ssr: false,
// })
// import VideoPlayer from '@/components/VideoPlayer';
import Plyr from "plyr-react"
import "plyr-react/plyr.css"

export default function Preview() {
  const [streamSrc, setStreamSrc] = useState<string>('')
  // const [streamTitle, setStreamTitle] = useState<string>('')
  const [playList, setPlayList] = useState<Episode[]>([])
  const [progress, setProgress] = useState<number>(0)

  async function getPreviewList() {
    const result = await axios.get('/api/anime', { params: { type: 'previewed' } });
    if (result.status !== 200) return;

    const animeList = result.data;
    const previewEpisodeList: Episode[] = [];
    for (let i = 0; i < animeList.length; i++) {
      const anime = animeList[i];
      const filteredEpisode = anime.episode.filter((episode: Episode) => episode.previewed);
      previewEpisodeList.push(...filteredEpisode);
    }

    setPlayList(previewEpisodeList);
    if (previewEpisodeList.length === 0) return;
    // setStreamTitle(previewEpisodeList[0].description);
    setStreamSrc('/api/stream/' + previewEpisodeList[0].id);
    getBufferProgress();
  }

  async function getTorrentStatus(playList: Episode[]) {
    console.log(1)
    const statusList =  playList.map(async (episode) => {
      const result = await axios.get('/api/torrent/' + episode.id);
      if (result.status !== 200) return;
      return result.data;
    });
    const status = await Promise.all(statusList);
    console.log(status);
  }

  async function getBufferProgress() {
    console.log(2)
    if (!streamSrc) return;
    console.log(streamSrc.split('/').pop())
    const result = await axios.get('/api/torrent/' + streamSrc.split('/').pop());
    if (result.status !== 200) return;
    // maybe torrent is not ready
    if (result.data.message === 'failed') return;
    console.log(result.data)
    console.log(result.data.progress)
    setProgress(result.data.torrentStatus.progress);
  }

  useEffect(() => {
    getPreviewList();
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (playList.length === 0) return;
      getBufferProgress();
    }, 2000);
  
    return () => clearInterval(intervalId);
  }, [streamSrc]);

  if (playList.length === 0) return ( <div className='w-full p-3 md:p-6'>No previewed episode.</div> );

  return (
    <div className='w-full mt-8 p-3 md:p-6'>
      <div className='block lg:inline-block lg:w-2/3 lg:pr-6'>
        {/* <video src={streamSrc} controls width="100%" height="100%" className="h-[80vh]"></video> */}
        {/* <VideoPlayer src={streamSrc}></VideoPlayer> */}
        <PlyrVideo streamSrc={streamSrc}></PlyrVideo>
        <div>buffer progress: {progress}</div>
      </div>
      <div className='block lg:inline-block lg:w-1/3 lg:align-top'>
        <div className='font-semibold text-black'>Preview list</div>
        {playList?.map((episode) => (
          <div className='py-2 border-t border-black' key={episode.id}>
            <button className='text-left text-sm' onClick={() => {
              // setStreamTitle(episode.description);
              setStreamSrc('/api/stream/' + episode.id);
              getBufferProgress();
            }}>
              {streamSrc === '/api/stream/' + episode.id ? (
                <span className='font-semibold text-black'>{episode.description}</span>
              ) : (
                <span className='text-gray-600'>{episode.description}</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const PlyrVideo = React.memo(({ streamSrc }: { streamSrc: string }) => <Plyr {...{source: {type: 'video', sources: [{src: streamSrc}]}}}/>);