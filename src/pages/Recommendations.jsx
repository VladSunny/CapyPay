import { useState, useEffect } from 'react';
import supabase from '../supabase-client';

function Recommendations() {
  
  return (
    <>
      <div className="flex items-center w-full h-full flex-col">
        <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Рекомендации</h1>

        <div className="flex items-center bg-base-300 w-7/8 md:w-4/5 xl:w-2/3 h-max rounded-2xl flex-col mt-5 p-5">
          <p className='text-justify md:text-2xl'>
            Графики есть, думайте сами
          </p>
        </div>
      </div>
    </>
  );
}

export default Recommendations;