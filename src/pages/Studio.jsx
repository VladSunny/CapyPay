import { useEffect, useState } from 'react';
import supabase from '../supabase-client';

function Studio() {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [ideaText, setIdeaText] = useState('');
  const [selectedOption, setSelectedOption] = useState('truth');
  const [session, setSession] = useState(null)

  const handleSubmit = async () => {
    const idea = {
      text: ideaText,
      is_dare: selectedOption === 'dare',
    };

    console.log('Form Submission:', idea);

    const { data, error } = await supabase.from('ideas').insert([idea]).single();

    if (error) {
      console.error('Error inserting data:', error);
      openErrorAlert();
    } else {
      openSuccessAlert();
      setIdeaText('');
    }
  };

  const openSuccessAlert = () => {
    setShowSuccessAlert(true);
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 3000);
  };

  const openErrorAlert = () => {
    setShowErrorAlert(true);
    setTimeout(() => {
      setShowErrorAlert(false);
    }, 3000);
  };

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

  if (!session) {
    return (
      <p className="text-2xl md:text-3xl xl:text-4xl text-error font-bold p-4">You are not logged in!</p>
    )
  }

  return (
    <>
      <div className="flex items-center h-full w-full flex-col">
        <h1 className="text-3xl md:text-6xl xl:text-8xl font-bold text-secondary bg-base-200 p-4 rounded-box">
          Studio
        </h1>

        <div className="flex flex-col items-center justify-around w-screen">

        <fieldset className="fieldset bg-base-200 border border-base-300 p-4 rounded-box w-3/4 shadow-2xl hover:shadow-secondary transition-all duration-500 md:w-4/7 lg:w-3/7">
          <legend className="fieldset-legend text-xl md:text-3xl text-primary">Your Idea</legend>
          
          <textarea
            className="textarea h-30 max-h-50 w-full md:text-2xl text-accent-content"
            placeholder="Idea"
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
          />
          
          <div className="flex flex-col space-y-3 mt-5">
            <div className="flex flex-row space-x-3 items-center">
              <input
                type="radio"
                name="radio-4"
                className="radio radio-primary"
                checked={selectedOption === 'truth'}
                onChange={() => setSelectedOption('truth')}
              />
              <p className="text-xl md:text-2xl text-primary">Truth</p>
            </div>

            <div className="flex flex-row space-x-3 items-center">
              <input
                type="radio"
                name="radio-4"
                className="radio radio-secondary"
                checked={selectedOption === 'dare'}
                onChange={() => setSelectedOption('dare')}
              />
              <p className="text-xl md:text-2xl text-secondary">Dare</p>
            </div>
          </div>
        </fieldset>

        <button
          className="btn btn-lg btn-success w-1/3 lg:w-1/5 mt-10 hover:btn-xl transition-all duration-500 subpixel-antialiased"
          onClick={() => {
            if (ideaText) {
              document.getElementById('my_modal_1').showModal();
            }
          }}
        >
          Submit
        </button>
      </div>
        
        
      </div>

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <p className="py-4">Are you sure?</p>
          <div className="modal-action">
            <form method="dialog" className="flex flex-row space-x-3">
              <button className="btn">Close</button>
              <button className="btn" onClick={handleSubmit}>Send</button>
            </form>
          </div>
        </div>
      </dialog>

      <div className="flex justify-center">
        <div
          role="alert"
          className={`absolute top-1/5 md:top-1/3 alert alert-success alert-soft transition-opacity duration-500 ${
            showSuccessAlert ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xl">Sended!</span>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          role="alert"
          className={`absolute top-1/5 md:top-1/3 alert alert-error alert-soft transition-opacity duration-500 ${
            showErrorAlert ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xl">Error occurred!</span>
        </div>
      </div>
    </>
  );
}

export default Studio;