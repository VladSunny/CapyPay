import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import TestLine from '../components/TestLine';
import axios from 'axios';
import TestBarChart from '../components/TestBarChart';
import TestPieChart from '../components/TestPieChart';

function Analysis() {
  const [session, setSession] = useState(null)
  const [data, setData] = useState(null)
  const [chartData, setChartData] = useState(null);

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
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://capypaybackend.onrender.com/api/data/price-quantity/${session.user.id}`);
        setChartData(response.data);
        console.log(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [session]);

  return (
    <>
      <div className="flex items-center w-full h-full flex-col space-y-5">
        <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Анализ покупок</h1>
        {/* <p>
          {chartData}
        </p> */}
        <TestLine />
        <TestBarChart />
        <TestPieChart />
      </div>
    </>
  );
}

export default Analysis;