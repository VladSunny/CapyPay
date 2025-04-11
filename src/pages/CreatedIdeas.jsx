import { useEffect, useState } from 'react';
import supabase from '../supabase-client';

function CreatedIdeas() {
  const [session, setSession] = useState(null)
  const [ideas, setIdeas] = useState([])


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

  useEffect(() => {
    if (session?.user) {
        supabase
            .from('ideas')
            .select('*')
            .eq('uuid', session.user.id)
            .order('created_at', { ascending: false })
            .then(({ data: ideas }) => {
            setIdeas(ideas)
            })
        
    }
  }, [session])

  return (
    <>
      <div className="flex items-center h-full w-full flex-col space-y-10 pb-5">
        {ideas.map((idea) => (
          <div key={idea.id} className="rounded-md bg-base-200 w-4/5 md:w-3/5 p-4">
            {idea.is_dare && (
                <>
                    <p className="text-lg text-secondary font-semibold">Dare:</p>
                    <p className="text-lg font-semibold">{idea.text}</p>
                </>
            )}

            {!idea.is_dare && (
                <>
                    <p className="text-lg text-primary font-semibold">Truth:</p>
                    <p className="text-lg font-semibold">{idea.text}</p>
                </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default CreatedIdeas;