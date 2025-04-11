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
      <div className="z-0 top-0 w-full sticky">
        <div className='navbar bg-base-200 flex flex-col w-full space-y-5'>
          <div>
            <div className='flex flex-row space-x-5 justify-center items-center bg-base-300 rounded-2xl p-5'>
              <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl">
                CapyPay
              </h1>
            </div>
          </div>
          <NavigationButton />
        </div>

      </div>
    </>
  )
}

export default Header
