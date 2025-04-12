import { useState, useEffect } from 'react';
import supabase from '../supabase-client';

function Home() {
  
  return (
    <>
      <div className="flex items-center w-full h-full flex-col">
        <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Главная</h1>

        <div className="flex items-center bg-base-300 w-7/8 md:w-4/5 xl:w-2/3 h-1/2 rounded-2xl flex-col mt-5 p-5">
          <p className='text-justify md:text-2xl'>
          CapyPay — ваш умный финансовый помощник, который помогает анализировать покупки и управлять расходами с умом. Наш сервис отслеживает ваши траты, выявляет финансовые привязанности и даёт персонализированные советы, чтобы вы могли копить эффективнее и платить меньше. С CapyPay финансовая свобода становится ближе с каждым днем — ведь мы верим, что грамотное управление деньгами должно быть доступным и удобным. Копи-плати с умом!
          </p>
        </div>
      </div>
    </>
  );
}

export default Home;