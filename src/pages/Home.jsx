import { useState, useEffect } from 'react';
import supabase from '../supabase-client';

function Home() {
  
  return (
    <>
      <div className="flex items-center w-full h-full flex-col">
        <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Главная</h1>
      </div>
    </>
  );
}

export default Home;