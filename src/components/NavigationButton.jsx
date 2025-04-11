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
      <div className='navbar flex space-x-5'>
          {session ? (
              <button onClick={logOut} className="btn btn-sm md:btn-md btn-secondary">Logout</button>
          ) : (
              <button onClick={signUp} className="btn btn-sm md:btn-md btn-secondary">Login</button>
          )}
          {location.pathname !== "/" && (
            <Link to="/">
                <button className="btn btn-sm md:btn-md btn-secondary">Home</button>
            </Link>
          )}
          {location.pathname !== "/studio" && session && (
            <Link to="/studio">
                <button className="btn btn-sm md:btn-md btn-secondary">Studio</button>
            </Link>
          )}
          {location.pathname !== "/created-ideas" && session && (
            <Link to="/created-ideas">
                <button className="btn btn-sm md:btn-md btn-secondary">Created Ideas</button>
            </Link>
          )}
      </div>
    </>
  )
}

export default NavigationButton
