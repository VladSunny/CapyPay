import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import supabase from '../supabase-client';

function NavigationButton() {
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

  const signUp = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: import.meta.VITE_REDIRECT_TO,
      },
    })
  }

  const logOut = async () => {
    await supabase.auth.signOut(
      {
        options: {
          redirectTo: import.meta.VITE_REDIRECT_TO,
        },
      }
    )
  }

  return (
    <>
      <div>
        <div className="dropdown dropdown-center">
          <div tabIndex={0} role="button" className="btn btn-sm md:btn-lg lg:btn-xl m-1 btn-primary">Навигация</div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-10 w-max p-2 shadow-sm space-y-2">
            <Link to="/profile" className='w-full'>
              <button className='btn btn-sm md:btn-md lg:btn-lg btn-secondary w-full'>Профиль</button>
            </Link>

            <Link to="/" className='w-full'>
              <button className='btn btn-sm md:btn-md lg:btn-lg btn-secondary w-full'>Главная</button>
            </Link>

            <Link to="/" className='w-full'>
              <button className='btn btn-sm md:btn-md lg:btn-lg btn-secondary w-full'>Рекомендации</button>
            </Link>

            <Link to="/analysis" className='w-full'>
              <button className='btn btn-sm md:btn-md lg:btn-lg btn-secondary w-full'>Аналитика</button>
            </Link>

            <Link to="/add" className='w-full'>
              <button className='btn btn-sm md:btn-md lg:btn-lg btn-secondary w-full'>Добавить</button>
            </Link>

            {session ? (
                <button onClick={logOut} className="btn btn-sm lg:btn-md btn-primary w-full">Logout</button>
            ) : (
                <button onClick={signUp} className="btn btn-sm lg:btn-md btn-primary w-full">Login</button>
            )}
          </ul>
        </div>
      </div>
    </>
  )
}

export default NavigationButton
