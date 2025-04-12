import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom';
import supabase from '../supabase-client';
import NavigationButton from './NavigationButton';

function Header() {
  const location = useLocation();
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <div className="z-10 top-0 w-full sticky">
        <div className='navbar bg-base-200 flex flex-row justify-around items-center w-full py-5'>
            <div className='flex flex-row justify-center items-center rounded-2xl p-5 space-x-2 md:space-x-5'>
              {/* <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl">
                CapyPay
              </h1> */}
              <img src="/CapyPay.png" className="h-12 md:h-30" />
              <i className=' text-xs md:text-4xl'>„Копи-плати“</i>
            </div>
            <NavigationButton />
        </div>

      </div>
    </>
  )
}

export default Header
