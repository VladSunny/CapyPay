import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom';
import supabase from '../supabase-client';

function NavigationButton() {
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

  const signUp = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: import.meta.VITE_REDIRECT_TO,
      },
    })
  }

  const logOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <div className='navbar flex justify-center space-x-10'>
        <button className='btn btn-xl btn-secondary'>Рекомендации</button>
        <button className='btn btn-xl btn-secondary'>Аналитика</button>
        <button className='btn btn-xl btn-secondary'>Добавить</button>
        <button className='btn btn-xl btn-secondary'>О сервисе</button>
        {session ? (
            <button onClick={logOut} className="btn btn-xl btn-primary">Logout</button>
        ) : (
            <button onClick={signUp} className="btn btn-xl btn-primary">Login</button>
        )}
      </div>
    </>
  )
}

export default NavigationButton
