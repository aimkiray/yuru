import React, { createRef, useState, useEffect } from 'react'
// import Layout from '../components/Layout'
import AnimeList from '@/components/AnimeList'
import { Anime } from '@/interfaces/anime'
import Logo from '@/components/Logo'
import Head from 'next/head'
import axios from 'axios';

export default function Dashboard() {
  const rssFeedRef = createRef<HTMLInputElement>();
  const miniButton = createRef<HTMLButtonElement>();
  const [exist, setExist] = useState<boolean>(true);
  const [animeData, setAnimeData] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    console.log('useEffect')
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
      const response = await axios.get('/api/anime')
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
    const rssFeed = rssFeedRef.current!.value
    // rssFeedRef.current!.value = ''
    getAnimeList(rssFeed).then(animeData => {
      setIsLoading(false)
      if (animeData && animeData.length > 0) {
        setAnimeData(animeData)
      } else {
        setExist(false)
      }
    }).catch(error => {

    });
  }

  const genFooter = () => {
    const divs = [];

    for (let i = 0; i < 22; i++) {
      divs.push(<div key={'footer_' + i} className="bg-primary" style={{ marginTop: i, height: 21 - i }}></div>);
    }
    return divs;
  }

  return (
    <div>
      <Head>
        <title>Anime subscribe</title>
      </Head>
      <div className='flex justify-between items-center m-3 md:m-6'>
        <div className='font-bold'>
          <Logo />
          <span></span>
        </div>
        <div className='hover:cursor-pointer underline-transparent underline-thickness-1 underline-offset-4 hover:underline hover:underline-inherit flex items-center justify-end text-lg xl:text-xl'>
          <span>Escape</span>
          <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 relative left-1' viewBox="0 0 24 24"><g transform="rotate(90 12 12)"><path fill="currentColor" d="M15.199 9.944a2.6 2.6 0 0 1-.79-1.55l-.403-3.083l-2.731 1.486a2.6 2.6 0 0 1-1.719.272L6.5 6.5l.57 3.056a2.6 2.6 0 0 1-.273 1.719l-1.486 2.73l3.083.403a2.6 2.6 0 0 1 1.55.79l2.138 2.258l1.336-2.807a2.6 2.6 0 0 1 1.23-1.231l2.808-1.336l-2.257-2.138Zm.025 5.564l-2.213 4.65a.6.6 0 0 1-.977.155l-3.542-3.739a.6.6 0 0 0-.358-.182l-5.106-.668a.6.6 0 0 1-.45-.882L5.04 10.32a.6.6 0 0 0 .063-.397L4.16 4.86a.6.6 0 0 1 .7-.7l5.062.943a.6.6 0 0 0 .397-.063l4.523-2.461a.6.6 0 0 1 .882.45l.668 5.105a.6.6 0 0 0 .182.358l3.739 3.542a.6.6 0 0 1-.155.977l-4.65 2.213a.6.6 0 0 0-.284.284Zm.797 1.927l1.414-1.414l4.242 4.242l-1.414 1.414l-4.242-4.242Z" /></g></svg>
        </div>
      </div>

      <div className='mx-3 md:mx-6 mt-48 text-6xl lg:text-7xl font-normal'>
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
          placeholder={exist ? 'Confirm or clear ↓' : 'Enter RSS feed'} />
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

      <div className='mt-32 h-64 bg-primary'>
        <div className='h-16'></div>
        <div className="border-t border-inverse text-base md:text-lg text-inverse mx-3 md:mx-6 py-2">
          <div className='inline-block w-5/12 md:w-1/4 xl:w-1/6'>Github</div>
          <div className='inline-block w-1/6 md:w-1/3 xl:w-7/12'></div>
          <div className='inline-block w-5/12 md:w-5/12 xl:w-1/4 text-right'>Back to top ↑</div>
        </div>
      </div>

      {genFooter()}

      <div className='h-32'></div>

    </div>
  )
}
