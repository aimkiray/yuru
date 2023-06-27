import React, { useState } from 'react';
import Link from "next/link";
import styles from './EpisodeList.module.css';
import { Episode } from '@/interfaces/anime'

const EpisodeList = ({ episode, onUpdate }) => {
  const [episodeList, setEpisodeList] = useState(episode);
  // const [selectAll, setSelectAll] = useState(true);

  // format date string to en-US format
  function formatDateEN(dateString: string): string {
    const dateObject = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };

    return dateObject.toLocaleDateString('en-US', options);
  }

  const toggleConfirmation = (episodeId: number) => {
    const updatedEpisodeList = episodeList.map((episode: Episode) => {
      if (episode.id === episodeId) {
        return { ...episode, confirmed: !episode.confirmed };
      }
      return episode;
    });
    // Check if all episodes are confirmed
    // let confirmAll = true;
    // for (let i = 0; i < updatedEpisodeList.length; i++) {
    //   confirmAll = confirmAll && episode.confirmed;
    // }
    // setSelectAll(confirmAll);
    setEpisodeList(updatedEpisodeList);

    // Call the onUpdate prop to inform the parent component of the change
    onUpdate(updatedEpisodeList);
  };

  const toggleAll = () => {
    const updatedEpisodeList = episodeList.map((episode: Episode) => {
      return { ...episode, confirmed: !episode.confirmed };
    });
    setEpisodeList(updatedEpisodeList);

    // Call the onUpdate prop to inform the parent component of the change
    onUpdate(updatedEpisodeList);
  };

  return (
    <ul className={`mb-6 ml-6`}>
      <li>
        <div className={`text-sm`}>
          <button onClick={() => toggleAll()}>
            <span>Select all / Reverse</span>
          </button>
        </div>
      </li>
      <li>-</li>
      {episodeList.map((episodeItem: Episode) => {
        return (
          <li key={episodeItem.id}>
            <div className={`text-sm ${styles["row-expand"]}`}>
              <button className='text-left' onClick={() => toggleConfirmation(episodeItem.id)}>
                {episodeItem.confirmed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className='w-4 h-4 mr-1 mb-1 inline' viewBox="0 0 24 24"><g transform="rotate(135 12 12)"><path fill="currentColor" d="m15.224 15.508l-2.213 4.65a.6.6 0 0 1-.977.155l-3.542-3.739a.6.6 0 0 0-.358-.182l-5.106-.668a.6.6 0 0 1-.45-.882L5.04 10.32a.6.6 0 0 0 .063-.397L4.16 4.86a.6.6 0 0 1 .7-.7l5.062.943a.6.6 0 0 0 .397-.063l4.523-2.461a.6.6 0 0 1 .882.45l.668 5.105a.6.6 0 0 0 .182.358l3.739 3.542a.6.6 0 0 1-.155.977l-4.65 2.213a.6.6 0 0 0-.284.284Zm.797 1.927l1.414-1.414l4.242 4.242l-1.414 1.414l-4.242-4.242Z" /></g></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className='w-4 h-4 mr-1 mb-1 inline' viewBox="0 0 24 24"><g transform="rotate(135 12 12)"><path fill="currentColor" d="M15.199 9.944a2.6 2.6 0 0 1-.79-1.55l-.403-3.083l-2.731 1.486a2.6 2.6 0 0 1-1.719.272L6.5 6.5l.57 3.056a2.6 2.6 0 0 1-.273 1.719l-1.486 2.73l3.083.403a2.6 2.6 0 0 1 1.55.79l2.138 2.258l1.336-2.807a2.6 2.6 0 0 1 1.23-1.231l2.808-1.336l-2.257-2.138Zm.025 5.564l-2.213 4.65a.6.6 0 0 1-.977.155l-3.542-3.739a.6.6 0 0 0-.358-.182l-5.106-.668a.6.6 0 0 1-.45-.882L5.04 10.32a.6.6 0 0 0 .063-.397L4.16 4.86a.6.6 0 0 1 .7-.7l5.062.943a.6.6 0 0 0 .397-.063l4.523-2.461a.6.6 0 0 1 .882.45l.668 5.105a.6.6 0 0 0 .182.358l3.739 3.542a.6.6 0 0 1-.155.977l-4.65 2.213a.6.6 0 0 0-.284.284Zm.797 1.927l1.414-1.414l4.242 4.242l-1.414 1.414l-4.242-4.242Z" /></g></svg>
                )}
                <span>{episodeItem.description}</span>
                <span> {formatDateEN(episodeItem.pubDate)}</span>
              </button>
              {/* <Link href="/page?torrent=123">
                <a>preview</a>
              </Link> */}
            </div>
          </li>
        )
      })}
    </ul>
  )
};

export default EpisodeList;