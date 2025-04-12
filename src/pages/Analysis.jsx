import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import TestLine from '../components/TestLine';
import axios from 'axios';
import TestBarChart from '../components/TestBarChart';
import TestPieChart from '../components/TestPieChart';
import { Line } from 'react-chartjs-2';

function Analysis() {
  const [session, setSession] = useState(null)
  const [data, setData] = useState(null)
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const response = await axios.get(`https://capypaybackend.onrender.com/api/data/price-quantity/${session?.user.id}`);
        setChartData(response.data);
        console.log(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  if (!session) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <div className="flex items-center w-full h-full flex-col space-y-5">
        <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Анализ покупок</h1>

        {/* <TestLine /> */}
        
        <h2>График количества</h2>
        <Line
          data={chartData.quantity}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Количество товаров',
              },
            },
          }}
        />

        <h2>График цены</h2>
        <Line
          data={chartData.price}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Цена товаров',
              },
            },
          }}
        />
        {/* <TestLine />
        <TestBarChart />
        <TestPieChart /> */}
      </div>
    </>
  );
}

export default Analysis;