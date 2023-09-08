import { Html, Head, Main, NextScript } from 'next/document'
import Logo from '@/components/Logo'
import Link from 'next/link'

export default function Document() {

  const genOpenFooter = () => {
    const divs = [];

    for (let i = 0; i < 24; i++) {
      divs.push(<div key={'footer_' + i} className="bg-primary" style={{ marginTop: i, height: 23 - i }}></div>);
    }
    return divs;
  }

  const getSVG = (d: string, fillColor: string) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill={fillColor} fillOpacity="1" d={d}></path></svg>
    )
  }

  const genFooter = (totalDivs: number) => {
    let divs = [];
    let zIndex = totalDivs * 2;
    let top = 0;

    // gen 4 svg path
    // let d = "M0,";
    // d += Math.floor((Math.random() * 0.5 + 0.5) * 320);
    // for (let i = 1; i <= 4; i++) {
    //   d += "L" + i * 360 + "," + Math.floor((Math.random() * 0.5 + 0.5) * 320);
    // }
    // d += "L1440,0L1080,0L720,0L360,0L0,0Z";

    // gen 3 svg path
    let d = "M0,";
    d += Math.floor((Math.random() * 0.5 + 0.5) * 320);
    for (let i = 1; i <= 3; i++) {
      d += "L" + i * 480 + "," + Math.floor((Math.random() * 0.5 + 0.5) * 320);
    }
    d += "L1440,0L960,0L480,0L0,0Z";


    for (let i = 0; i < totalDivs; i++) {
      divs.push(
        <div key={`footer-${i}`}>
          <div className='absolute w-full' style={{ zIndex: zIndex--, top: top }}>
            {getSVG(d, '#000000')}
          </div>
          <div className='absolute w-full' style={{ zIndex: zIndex--, top: top + i + 1 }}>
            {getSVG(d, '#ffffff')}
          </div>
        </div>
      )
      top += totalDivs;
    }

    return divs;
  }

  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <body>
        <div className='hidden md:block p-3 md:p-6'>
          <Link href='/' className='flex items-center w-auto md:w-1/4 2xl:w-1/6'>
            <span className='w-12 h-12 md:w-10 md:h-10'><Logo /></span>
          </Link>
        </div>
        <div className='md:fixed md:top-0 bg-inverse z-50 flex items-center p-3 md:p-6 w-full'>
          <Link href='/' className='flex items-center w-auto md:w-1/4 2xl:w-1/6'>
            <span className='w-12 h-12 md:w-10 md:h-10'><Logo /></span>
            <svg viewBox="153.236 100.47 187.088 60.108" className='pl-2 h-6 hidden md:inline-block' xmlns="http://www.w3.org/2000/svg">
              <path d="M 153.513 -20.816 C 173.906 -20.816 188.161 -10.125 184.915 3.577 C 180.876 20.644 156.642 28.048 141.911 28.048 L 114.905 28.048 L 123.022 -6.085 L 142.03 -6.085 L 136.485 17.238 L 140.762 17.238 C 152.127 17.238 162.897 13.12 165.155 3.577 C 167.808 -7.551 155.216 -10.045 147.454 -10.045 L 100.175 -10.045 C 87.979 -10.045 78.198 -5.096 76.178 3.616 C 73.565 14.941 86.276 17.277 94.077 17.277 L 112.727 17.277 L 110.233 28.047 L 87.939 28.047 C 67.625 28.047 53.37 17.317 56.379 3.616 C 56.933 1.121 59.982 -5.135 63.23 -8.897 L 63.745 -9.452 C 64.339 -10.165 63.784 -10.6 63.151 -9.888 L 62.557 -9.175 L 19.593 39.292 L -1.712 -20.816 L 16.662 -20.816 L 21.73 -5.967 C 26.838 8.922 26.561 11.615 26.561 11.615 C 26.561 11.615 26.601 10.071 39.43 -5.808 L 52.101 -20.816 L 153.513 -20.816 Z" transform="matrix(1, 0, 0, 1, 154.948471, 121.285507)" />
            </svg>
            {/* <span className='text-2xl pl-1 italic hidden md:inline-block'>Virtual</span> */}
            {/* <span className='text-2xl pl-0.5 font-semibold hidden md:inline-block'>CD</span> */}
          </Link>
          <div className='flex items-center text-lg w-full md:w-3/4 2xl:w-5/6'>
            <div className='w-full text-center md:text-left'>
              <Link className='inline-block pr-4 md:pr-8' href='/subscribe'>Subscribe</Link>
              <Link className='inline-block pr-4 md:pr-8' href='/preview' target='_blank'>
                Preview
                {/* <svg xmlns="http://www.w3.org/2000/svg" className='h-4 w-4 hidden md:inline relative left-0.5 md:left-1 bottom-0.5' viewBox="0 0 24 24"><path fill="currentColor" d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6Zm11-3v8h-2V6.413l-7.793 7.794l-1.414-1.414L17.585 5H13V3h8Z" /></svg> */}
                <svg xmlns="http://www.w3.org/2000/svg" className='h-6 w-6 hidden md:inline relative left-0.5 md:left-1 bottom-0.5' viewBox="0 0 24 24"><g transform="rotate(90 12 12)"><path fill="currentColor" d="M15.199 9.944a2.6 2.6 0 0 1-.79-1.55l-.403-3.083l-2.731 1.486a2.6 2.6 0 0 1-1.719.272L6.5 6.5l.57 3.056a2.6 2.6 0 0 1-.273 1.719l-1.486 2.73l3.083.403a2.6 2.6 0 0 1 1.55.79l2.138 2.258l1.336-2.807a2.6 2.6 0 0 1 1.23-1.231l2.808-1.336l-2.257-2.138Zm.025 5.564l-2.213 4.65a.6.6 0 0 1-.977.155l-3.542-3.739a.6.6 0 0 0-.358-.182l-5.106-.668a.6.6 0 0 1-.45-.882L5.04 10.32a.6.6 0 0 0 .063-.397L4.16 4.86a.6.6 0 0 1 .7-.7l5.062.943a.6.6 0 0 0 .397-.063l4.523-2.461a.6.6 0 0 1 .882.45l.668 5.105a.6.6 0 0 0 .182.358l3.739 3.542a.6.6 0 0 1-.155.977l-4.65 2.213a.6.6 0 0 0-.284.284Zm.797 1.927l1.414-1.414l4.242 4.242l-1.414 1.414l-4.242-4.242Z" /></g></svg>
              </Link>
              <Link className='inline-block' href='/subscribe'>Settings</Link>
            </div>

            <div className='hover:cursor-pointer underline-transparent underline-thickness-1 underline-offset-4 hover:underline hover:underline-inherit flex items-center justify-end text-lg text-right'>
              <span className='hidden md:inline'>Escape</span>
              <svg xmlns="http://www.w3.org/2000/svg" className='w-10 h-10 md:w-6 md:h-6 relative left-1' viewBox="0 0 24 24"><g transform="rotate(90 12 12)"><path fill="currentColor" d="M15.199 9.944a2.6 2.6 0 0 1-.79-1.55l-.403-3.083l-2.731 1.486a2.6 2.6 0 0 1-1.719.272L6.5 6.5l.57 3.056a2.6 2.6 0 0 1-.273 1.719l-1.486 2.73l3.083.403a2.6 2.6 0 0 1 1.55.79l2.138 2.258l1.336-2.807a2.6 2.6 0 0 1 1.23-1.231l2.808-1.336l-2.257-2.138Zm.025 5.564l-2.213 4.65a.6.6 0 0 1-.977.155l-3.542-3.739a.6.6 0 0 0-.358-.182l-5.106-.668a.6.6 0 0 1-.45-.882L5.04 10.32a.6.6 0 0 0 .063-.397L4.16 4.86a.6.6 0 0 1 .7-.7l5.062.943a.6.6 0 0 0 .397-.063l4.523-2.461a.6.6 0 0 1 .882.45l.668 5.105a.6.6 0 0 0 .182.358l3.739 3.542a.6.6 0 0 1-.155.977l-4.65 2.213a.6.6 0 0 0-.284.284Zm.797 1.927l1.414-1.414l4.242 4.242l-1.414 1.414l-4.242-4.242Z" /></g></svg>
            </div>
          </div>
        </div>

        <Main />
        <NextScript />

        <div className='mt-32 bg-primary'>
          <div className='pt-12 pb-24 mx-3 md:mx-6'>
            <span className='text-2xl italic hidden md:inline-block text-inverse'>Virtual</span>
            <span className='text-2xl pl-0.5 font-semibold hidden md:inline-block text-inverse'>CD</span>
          </div>
          <div className="border-t border-inverse text-base md:text-lg text-inverse mx-3 md:mx-6 py-2">
            <div className='inline-block w-5/12 md:w-1/4 xl:w-1/6'>GitHub</div>
            <div className='inline-block w-1/6 md:w-1/3 xl:w-7/12'></div>
            <div className='inline-block w-5/12 md:w-5/12 xl:w-1/4 text-right'>Back to top ↑</div>
          </div>
        </div>

        <div className='relative'>
          {genFooter(24)}
          {/* {getSVG('#000')} */}
          {/* <div className='absolute w-full' style={{zIndex: 24, top: 0}}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#000000" fill-opacity="1" d="M0,64L40,74.7C80,85,160,107,240,106.7C320,107,400,85,480,69.3C560,53,640,43,720,53.3C800,64,880,96,960,112C1040,128,1120,128,1200,117.3C1280,107,1360,85,1400,74.7L1440,64L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"></path></svg>
          </div>
          <div className='absolute w-full' style={{zIndex: 23, top: 1}}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fill-opacity="1" d="M0,64L40,74.7C80,85,160,107,240,106.7C320,107,400,85,480,69.3C560,53,640,43,720,53.3C800,64,880,96,960,112C1040,128,1120,128,1200,117.3C1280,107,1360,85,1400,74.7L1440,64L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"></path></svg>
          </div>
          <div className='absolute w-full' style={{zIndex: 22, top: 24}}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#000000" fill-opacity="1" d="M0,64L40,74.7C80,85,160,107,240,106.7C320,107,400,85,480,69.3C560,53,640,43,720,53.3C800,64,880,96,960,112C1040,128,1120,128,1200,117.3C1280,107,1360,85,1400,74.7L1440,64L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"></path></svg>
          </div>
          <div className='absolute w-full' style={{zIndex: 21, top: 26}}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fill-opacity="1" d="M0,64L40,74.7C80,85,160,107,240,106.7C320,107,400,85,480,69.3C560,53,640,43,720,53.3C800,64,880,96,960,112C1040,128,1120,128,1200,117.3C1280,107,1360,85,1400,74.7L1440,64L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"></path></svg>
          </div>
          <div className='absolute w-full' style={{zIndex: 20, top: 49}}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#000000" fill-opacity="1" d="M0,64L40,74.7C80,85,160,107,240,106.7C320,107,400,85,480,69.3C560,53,640,43,720,53.3C800,64,880,96,960,112C1040,128,1120,128,1200,117.3C1280,107,1360,85,1400,74.7L1440,64L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"></path></svg>
          </div>
          <div className='absolute w-full' style={{zIndex: 19, top: 52}}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fill-opacity="1" d="M0,64L40,74.7C80,85,160,107,240,106.7C320,107,400,85,480,69.3C560,53,640,43,720,53.3C800,64,880,96,960,112C1040,128,1120,128,1200,117.3C1280,107,1360,85,1400,74.7L1440,64L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"></path></svg>
          </div> */}
        </div>

      </body>
    </Html>
  )
}
