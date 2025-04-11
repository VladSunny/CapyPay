import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import TestLine from '../components/TestLine';
import TestBarChart from '../components/TestBarChart';
import TestPieChart from '../components/TestPieChart';

function Analysis() {
  
  return (
    <>
      <div className="flex items-center w-full h-full flex-col space-y-5">
        <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Анализ покупок</h1>
        <TestLine />
        <TestBarChart />
        <TestPieChart />
      </div>
    </>
  );
}

export default Analysis;