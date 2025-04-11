import { useState, useEffect } from 'react';
import supabase from '../supabase-client';

function Home() {
  const [currentCard, setCurrentCard] = useState("Choose");
  const [currentTask, setCurrentTask] = useState("");
  const [displayTask, setDisplayTask] = useState(""); // Текст с анимацией

  async function getRandomIdea(is_dare) {
    try {
      const { data, error } = await supabase
        .rpc('get_random_idea', { is_dare_filter: is_dare });
  
      if (error) throw error;
  
      return data[0]['text'];
    } catch (error) {
      console.error('Ошибка при получении случайной идеи:', error);
    }
  }

  const updateTask = async (nextCard) => {
    if (nextCard === "Random") {
      nextCard = Math.random() > 0.5 ? "Truth" : "Dare";
    }

    if (nextCard === "Truth") {
      setCurrentCard("Truth");

      let text = await getRandomIdea(false);
      if (!text)
        return;

      setCurrentTask(text);
    } else if (nextCard === "Dare") {
      setCurrentCard("Dare");

      let text = await getRandomIdea(true);
      if (!text)
        return;

      setCurrentTask(text);
    }
  };

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= currentTask.length) {
        setDisplayTask(currentTask.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30); // Скорость печатания (ms на символ)

    return () => clearInterval(interval);
  }, [currentTask]);

  return (
    <>
      <div className="flex items-center w-full h-full flex-col">
        {/* {session?.user && <p className="text-2xl md:text-3xl mb-5">Hello, {session?.user?.user_metadata?.full_name}</p>} */}
        <div className="bg-base-300 w-5/6 md:w-7/12 lg:w-3/7 mt-5 h-1/2 shadow-2xl rounded-2xl md:rounded-3xl hover:shadow-primary transition-all duration-500">
          <div className="card-body">
            <h2 className="card-title">
              <p className="text-center text-secondary text-3xl">
                {currentCard}
              </p>
            </h2>

            <article className="w-full h-full text-center text-wrap typing-animation">
              <p>{displayTask}</p>
            </article>

          </div>
        </div>

        {/* <div className="flex card-actions justify-evenly pt-10">
          <button className="btn btn-md md:btn-lg btn-soft btn-primary" onClick={() => updateTask("Truth")}>Next Truth</button>
          <button className="btn btn-md md:btn-lg btn-soft btn-info" onClick={() => updateTask("Random")}>Next Random</button>
          <button className="btn btn-md md:btn-lg btn-soft btn-secondary" onClick={() => updateTask("Dare")}>Next Dare</button>
        </div>

        <div className='flex flex-row space-x-5 justify-center items-center'>
          <div className="rating pt-10">
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" aria-label="1 star" />
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" aria-label="2 star" defaultChecked />
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" aria-label="3 star" />
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" aria-label="4 star" />
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" aria-label="5 star" />
          </div>

          <button className='btn btn-md md:btn-lg bg-orange-400 mt-10'>Send rating</button>
        </div> */}
      </div>
    </>
  );
}

export default Home;