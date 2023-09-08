import React, { createRef, useState, useEffect } from 'react'
// import Layout from '../components/Layout'
import AnimeList from '@/components/AnimeList'
import { Anime } from '@/interfaces/anime'

import Head from 'next/head'
import axios from 'axios';

export default function Dashboard() {
  const rssFeedRef = createRef<HTMLInputElement>();
  const miniButton = createRef<HTMLButtonElement>();
  const [exist, setExist] = useState<boolean>(true);
  const [animeData, setAnimeData] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)
    fetchAnimeList().then(animeData => {
      setIsLoading(false)
      if (animeData && animeData.length > 0) {
        setAnimeData(animeData)
      } else {
        setExist(false)
      }
    }).catch(error => {

    });
  }, [])

  async function fetchAnimeList() {
    try {
      const response = await axios.get('/api/anime', { params: { type: 'unconfirmed' } })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async function getAnimeList(url: string): Promise<Anime[]> {
    const param = url.split('?')[1];

    try {
      const response = await axios.get(`/api/parser?${param}`)
      if (response.status !== 200) {
        throw new Error(response.data.error)
      }
      return response.data
    } catch (error) {
      throw error
    }
  }

  const handleClick = async () => {
    setIsLoading(true)
    setExist(true)
    const rssFeed = rssFeedRef.current!.value
    rssFeedRef.current!.value = ''
    getAnimeList(rssFeed).then(animeData => {
      setIsLoading(false)
      if (animeData && animeData.length > 0) {
        setAnimeData(animeData)
      } else {
        setExist(false)
        window.alert('duplicate anime')
      }
    }).catch(error => {

    });
  }

  return (
    <div>
      <Head>
        <title>Anime subscribe</title>
      </Head>

      <div className='mx-3 md:mx-6 mt-48 text-5xl md:text-6xl lg:text-7xl font-normal'>
        Anime subscribe
      </div>

      <div className='flex justify-between items-center mx-3 md:mx-6 my-14 h-11 lg:h-12'>
        <input
          onFocus={() => {
            miniButton.current!.style.borderColor = '#000000'
          }}
          onBlur={() => {
            miniButton.current!.style.borderColor = 'rgba(0,0,0,.2)'
          }}
          ref={rssFeedRef}
          type="text"
          className="w-full h-full rounded-none border border-r-0 md:border-r border-secondary bg-inverse focus:border-primary focus:outline-0 md:mr-4 px-4"
          disabled={exist}
          placeholder={exist ? 'Confirm or clear ↓' : 'Subscription link'} />
        <button disabled={exist} onClick={handleClick} className={`md:block hidden w-10 md:w-60 lg:w-80 h-full rounded-none hover:bg-inverse hover:text-primary border border-primary ${exist ? 'bg-inverse text-primary' : 'bg-primary text-inverse'}`}>Analysis</button>
        <button disabled={exist} onClick={handleClick} ref={miniButton!} className={`block md:hidden w-12 h-full rounded-none hover:bg-primary hover:text-inverse border border-l-0 hover:border-primary hover:border-l text-center ${exist ? 'bg-primary text-inverse border-l border-primary' : 'bg-inverse text-primary border-l-0 border-secondary'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className='mx-auto my-0' width="1rem" height="1rem" viewBox="0 0 20 20"><path fill="currentColor" d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33l-1.42 1.42l-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" /></svg>
        </button>
      </div>

      {isLoading ? (
        <div className='mx-3 md:mx-6 text-xl font-normal h-64'>Now Loading...</div>
      ) : animeData.length > 0 ? (
        <AnimeList animeList={animeData} />
      ) : <div className='h-64'></div>}

    </div>
  )
}
