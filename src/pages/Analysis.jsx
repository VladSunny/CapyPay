import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import TestLine from '../components/TestLine';
import axios from 'axios';
import TestBarChart from '../components/TestBarChart';
import TestPieChart from '../components/TestPieChart';
import { Line } from 'react-chartjs-2';
import LineChart from '../components/LineChart';

function Analysis() {
  const [session, setSession] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(session?.user);
        const response = await axios.get(
          `https://capypaybackend.onrender.com/api/data/price-quantity/${session?.user.id}`
        );
        setChartData(response.data);
        console.log('Quantity:', response.data.quantity);
        console.log('Price:', response.data.price);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  if (!session) {
    return <div>Вы не вошли в аккаунт</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!chartData || !chartData.quantity || !chartData.price) {
    return <div>Нет данных для отображения</div>;
  }

  return (
    <div className="flex items-center w-full h-full flex-col space-y-5">
      <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Анализ покупок</h1>
      <div className="flex items-center w-2/3 flex-col">
        <h2>График количества</h2>
        <LineChart key="quantity" chartTitle="Количество товаров" chartData={chartData.quantity} />
      </div>
      <div className="flex items-center w-2/3 flex-col">
        <h2>График цены</h2>
        <LineChart key="price" chartTitle="Цена товаров" chartData={chartData.price} />
      </div>
    </div>
  );
}

export default Analysis;