import React, { Fragment, useState, createRef, useEffect } from 'react'
import styles from '@/components/AnimeList.module.css'
import { Anime, Episode, SubGroup } from '@/interfaces/anime'
import EpisodeList from './EpisodeList';
import axios from 'axios';

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
  Row,
  FilterFn,
  SortingFn,
  sortingFns,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'

import {
  RankingInfo,
  rankItem,
  compareItems,
  rankings,
} from '@tanstack/match-sorter-utils'

const mikanBaseUrl = 'https://mikanani.me';
const mikanAnimeUrl = `${mikanBaseUrl}/Home/Bangumi/`;
const mikanPublishGroupUrl = `${mikanBaseUrl}/Home/PublishGroup/`;
const bgmBaseUrl = 'https://bgm.tv';
const bgmAnimeUrl = `${bgmBaseUrl}/subject/`;

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value, { threshold: rankings.CONTAINS })

  // Store the itemRank info
  addMeta({
    itemRank,
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId] && rowB.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!
    )
  }

  if (dir !== 0) {
    return dir
  }

  if (columnId === 'startDate') {
    return sortingFns.datetime(rowA, rowB, columnId)
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return sortingFns.alphanumeric(rowA, rowB, columnId)
}

const columns: ColumnDef<Anime>[] = [
  {
    id: 'expand',
    accessorFn: row => row.startDate,
    cell: ({ row }) => (
      <div className={`${styles['table-row-custom']} inline md:inline-block md:w-1/4 xl:w-3/12 2xl:w-1/6`}>
        {row.getCanExpand() ? (
          <button
            className='inline'
            {...{
              style: { cursor: 'pointer' },
            }}
          >
            {row.getIsExpanded() ? <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 inline relative right-1.5 bottom-0.5' viewBox="0 0 24 24"><path fill="currentColor" d="m12 8l-6 6l1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 inline relative right-1.5 bottom-0.5' viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17L7.41 8.59L6 10l6 6l6-6l-1.41-1.41z" /></svg>}
            <span className='relative right-1.5 text-gray-600'>({row.original.episode.length < 10 ? '0' + row.original.episode.length.toString() : row.original.episode.length.toString()})</span>
          </button>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 inline' viewBox="0 0 24 24"><path fill="currentColor" d="M4 11h16v2H4z" /></svg>
        )}
        <div className='hidden md:inline'>
          {row.original.startDate}
        </div>
      </div>
    ),
    footer: props => props.column.id,
  },
  {
    id: 'name',
    accessorFn: row => `${row.name} ${row.nameAlias} ${row.nameRaw}`,
    cell: ({ row }) => (
      <div className={`${styles['table-row-custom']} pr-4 xl:pr-12 inline md:inline-block md:w-7/12 xl:w-1/2 2xl:w-7/12`}>
        <a target='_blank' className='hover:underline hover:underline-offset-4' href={bgmAnimeUrl + row.original.bgmId}>
          <span>{row.original.name} / {row.original.nameAlias}</span>
          <span className='hidden 2xl:inline'> / {row.original.nameRaw}</span>
        </a>
      </div>
    ),
    footer: props => props.column.id,
  },
  {
    id: 'wrap',
    cell: () => (
      <div className='inline-block md:hidden w-full'>
      </div>
    ),
  },
  {
    id: 'startDate',
    accessorFn: row => new Date(row.startDate),
    sortingFn: fuzzySort,
    cell: ({ row }) => (
      <div className='inline-block md:hidden w-2/3'>
        {row.original.startDate}
      </div>
    ),
  },
  {
    id: 'publishGroup',
    accessorFn: row => row.subGroup.map(sg => sg.name).join(' '),
    cell: ({ row }) => (
      <div className={`${styles['table-row-custom']} pr-2 hidden xl:inline-block xl:w-1/6`}>
        {
          row.original.subGroup.map((sg, index) => {
            return (
              <div key={`sg-${sg.sourceId}`} className='inline'>
                <a target='_blank' className='inline hover:underline hover:underline-offset-4' href={mikanPublishGroupUrl + sg.sourceId}>
                  {sg.name}
                </a>
                <span>{(index !== row.original.subGroup.length - 1) ? ', ' : ' '}</span>
              </div>
            )
          })
        }
      </div>
    ),
    footer: props => props.column.id,
  },
  {
    id: 'sourceId',
    accessorFn: row => row.sourceId,
    cell: ({ row }) => (
      <div className={`${styles['table-row-custom']} inline-block text-right w-1/3 md:w-1/6 xl:w-1/12`}>
        <a target='_blank' className='inline-block text-right hover:underline hover:underline-offset-4' href={mikanAnimeUrl + row.original.sourceId}>
          <span className='pr-1'>Profile</span>
          <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 inline-block relative bottom-0.5 left-1' viewBox="0 0 24 24"><g transform="rotate(90 12 12)"><path fill="currentColor" d="M15.199 9.944a2.6 2.6 0 0 1-.79-1.55l-.403-3.083l-2.731 1.486a2.6 2.6 0 0 1-1.719.272L6.5 6.5l.57 3.056a2.6 2.6 0 0 1-.273 1.719l-1.486 2.73l3.083.403a2.6 2.6 0 0 1 1.55.79l2.138 2.258l1.336-2.807a2.6 2.6 0 0 1 1.23-1.231l2.808-1.336l-2.257-2.138Zm.025 5.564l-2.213 4.65a.6.6 0 0 1-.977.155l-3.542-3.739a.6.6 0 0 0-.358-.182l-5.106-.668a.6.6 0 0 1-.45-.882L5.04 10.32a.6.6 0 0 0 .063-.397L4.16 4.86a.6.6 0 0 1 .7-.7l5.062.943a.6.6 0 0 0 .397-.063l4.523-2.461a.6.6 0 0 1 .882.45l.668 5.105a.6.6 0 0 0 .182.358l3.739 3.542a.6.6 0 0 1-.155.977l-4.65 2.213a.6.6 0 0 0-.284.284Zm.797 1.927l1.414-1.414l4.242 4.242l-1.414 1.414l-4.242-4.242Z" /></g></svg>
        </a>
      </div>
    ),
    footer: props => props.column.id,
  },
]

// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

type TableProps<TData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  getRowCanExpand: (row: Row<TData>) => boolean
}

function Table({
  data,
  columns,
  getRowCanExpand,
}: TableProps<Anime>): JSX.Element {
  const [globalFilter, setGlobalFilter] = useState('')
  const filterInputRef = createRef<HTMLInputElement>()
  const [filterFormVisible, setFilterFormVisible] = useState(false)
  const [filterList, setFilterList] = useState([])
  const [animeData, setAnimeData] = useState<Anime[]>([])

  const updateEpisodeList = (animeId: number, updatedEpisodeList: Episode[]) => {
    setAnimeData((prev) => {
      return prev.map((anime) => {
        if (anime.id === animeId) {
          anime.episode = updatedEpisodeList;
        }
        return anime;
      });
    });
  };

  async function getFilterList() {
    const response = await axios.get('/api/filter');
    setFilterList(response.data.data);
  }

  async function addFilterString() {
    const filter = filterInputRef.current?.value
    if (!filter) return
    filterInputRef.current!.value = ''

    const filterData = {
      text: filter,
    };

    await axios.post('/api/filter', filterData)
    await getFilterList();
  }

  async function deleteFilterString(filterId: string) {
    await axios.delete(`/api/filter/${filterId}`)
    await getFilterList();
  }

  function handleSortSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value
    const desc = value.startsWith('-')
    const columnId = value.replace('-', '')
    const sorting = [{ id: columnId, desc }]
    table.setSorting(sorting)
  }

  const table = useReactTable<Anime>({
    data: animeData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    // getColumnCanGlobalFilter: (column) => column.id === 'global',
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  useEffect(() => {
    // set default sorting to startDate
    table.setSorting([{ id: 'startDate', desc: true }])

    const fetchData = async () => {
      try {
        // get filter list from db
        await getFilterList();
        console.log(filterList)

        const tempData = data.map((anime) => {
          console.log(anime)
          const { episode, ...pureAnime } = anime;
          const tempEpisode = episode.filter((episodeItem) => {
            const episodeName = episodeItem.description.toLowerCase();
            return !filterList.some((filter) =>
              episodeName.includes(filter.text.toLowerCase())
            );
          });
          if (tempEpisode.length === 0) return null;
          // set confirmed to true for all episode
          tempEpisode.forEach((episodeItem) => {
            episodeItem.confirmed = true;
          });
          return {
            ...pureAnime,
            episode: tempEpisode,
          };
        }).filter((anime) => anime !== null);

        setAnimeData(tempData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Perform additional error handling if needed
      }
    };

    fetchData();
  }, [data.length, filterList.length]);

  return (
    <div className="mx-3 md:mx-6">
      <div className="w-full border-t border-primary text-base xl:text-lg font-semibold mt-16 py-2">
        <div className='inline-block w-5/12 md:w-1/4 xl:w-3/12 2xl:w-1/6'>
          <button className='flex items-center border-0' onClick={() => setFilterFormVisible(!filterFormVisible)}>
            <span className='pr-1'>Filter and sort</span>
            <svg xmlns="http://www.w3.org/2000/svg" className='w-7 h-7' viewBox="0 0 24 24"><path fill="currentColor" d="M7 11h10v2H7zM4 7h16v2H4zm6 8h4v2h-4z" /></svg>
          </button>
        </div>
        <div className='inline-block w-1/6 md:w-1/3 xl:w-1/2 2xl:w-7/12'>
          <button
            onClick={() => table.toggleAllRowsExpanded()}>
            Expand
          </button>
        </div>
        <div className='inline-block w-5/12 md:w-5/12 xl:w-1/4 text-right'>
          <button className='border-0'>Confirm and download</button>
        </div>
      </div>

      <div className={`mt-4 text-sm xl:text-base ${filterFormVisible ? 'block' : 'hidden'}`}>
        <div className='flex items-center h-8 mb-4'>
          <input
            ref={filterInputRef}
            type="text"
            className="h-full w-full md:w-1/4 2xl:w-1/6 rounded-none border border-r-0 border-secondary bg-inverse focus:border-primary focus:outline-0 px-2"
            placeholder="Add filter..."
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                addFilterString();
              }
            }}
          />
          <button onClick={addFilterString} className='h-full w-20 rounded-none bg-primary hover:bg-inverse hover:text-primary border border-primary hover:border-primary text-inverse'>Add</button>
        </div>
        <div>
          {filterList.length > 0 && filterList.map((filter: any) => (
            <span key={filter.id} className='inline-flex items-center justify-between px-2 py-1 mr-4 mb-4 rounded-full border text-sm'>
              {filter.text}
              <button className='ml-1' onClick={() => deleteFilterString(filter.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" className='w-4 h-4' viewBox="0 0 24 24"><path fill="currentColor" d="m16.192 6.344l-4.243 4.242l-4.242-4.242l-1.414 1.414L10.535 12l-4.242 4.242l1.414 1.414l4.242-4.242l4.243 4.242l1.414-1.414L13.364 12l4.242-4.242z" /></svg>
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className={`flex items-center justify-between text-sm xl:text-base ${filterFormVisible ? 'block' : 'hidden'}`}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          className="h-8 w-1/2 md:w-1/4 2xl:w-1/6 rounded-none border border-secondary bg-inverse focus:border-primary focus:outline-0 px-2"
          placeholder="Search all columns..."
        />
        <div className='flex items-center relative left-1.5'>
          <select className='focus:outline-0 md:text-right appearance-none' id="sortSelect" onChange={handleSortSelect}>
            <option value="-startDate">Start date: newest</option>
            <option value="startDate">Start date: oldest</option>
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 inline' viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17L7.41 8.59L6 10l6 6l6-6l-1.41-1.41z" /></svg>
        </div>
      </div>

      <div className='h-16'></div>

      <ul className={`w-full text-base xl:text-lg`}>
        {table.getRowModel().rows.map(row => {
          return (
            <Fragment key={row.id}>
              <li className='py-3 w-full border-t border-black' onClick={row.getToggleExpandedHandler()}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <Fragment key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Fragment>
                  )
                })}
              </li>
              {row.getIsExpanded() && (
                <li>
                  <div>
                    <EpisodeList
                      episode={row.original.episode}
                      onUpdate={(updatedEpisodeList: Episode[]) =>
                        updateEpisodeList(row.original.id, updatedEpisodeList)
                      }
                    />
                  </div>
                </li>
              )}
            </Fragment>
          )
        })}
      </ul>
      <div className="w-full border-t border-primary text-base md:text-lg font-semibold mt-16 py-2">
        <div className='inline-block w-5/12 md:w-1/4 xl:w-1/6'>1 - {table.getRowModel().rows.length} of {table.getRowModel().rows.length}</div>
        <div className='inline-block w-1/6 md:w-1/3 xl:w-7/12'></div>
        <div className='inline-block w-5/12 md:w-5/12 xl:w-1/4 text-right'>Clear</div>
      </div>
    </div>
  )
}

const AnimeList: React.FC<{ animeList: Anime[] }> = ({ animeList }) => {
  return (
    <Table
      data={animeList}
      columns={columns}
      getRowCanExpand={() => true}
    />
  )
}

export default AnimeList
