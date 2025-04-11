import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import TestLine from '../components/TestLine';

function Analysis() {
  
  return (
    <>
      <div className="flex items-center w-full h-full flex-col">
        <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Анализ покупок</h1>
        <TestLine />
      </div>
    </>
  );
}

export default Analysis;