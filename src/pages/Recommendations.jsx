import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import LineChart from '../components/charts/LineChart';

function Recommendations() {
  const [session, setSession] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tag, setTag] = useState(''); // State for selected tag
  const [tags, setTags] = useState([]); // State for available tags
  const [chartData, setChartData] = useState(null); // State for chart data
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [analysisResult, setAnalysisResult] = useState(null);

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
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch unique tags when session is available
  useEffect(() => {
    const fetchTags = async () => {
      if (session) {
        try {
          const response = await axios.get(
            `https://capypaybackend.onrender.com/api/data/get-u-tags/${session.user.id}`
          );
          setTags(response.data);
        } catch (err) {
          console.error('Error fetching tags:', err);
          setNotification({ message: 'Ошибка загрузки категорий', type: 'error' });
        }
      }
    };
    fetchTags();
  }, [session]);

  // Fetch chart data when tag, startDate, or endDate changes
  useEffect(() => {
    const fetchChartData = async () => {
      if (session && tag && startDate && endDate) {
        try {
          const params = { start_date: startDate, end_date: endDate, tag };
          const response = await axios.get(
            `https://capypaybackend.onrender.com/api/data/tag/price-quantity/line-chart/${session.user.id}`,
            { params }
          );
          setChartData(response.data);
        } catch (err) {
          console.error('Error fetching chart data:', err);
          setNotification({ message: 'Ошибка загрузки данных графика', type: 'error' });
          setChartData(null);
        }
      }
    };
    fetchChartData();
  }, [session, tag, startDate, endDate]);

  const handleGetAnalysis = async (event) => {
    event.preventDefault();
    if (!startDate || !endDate) {
      setNotification({ message: 'Пожалуйста, выберите начальную и конечную дату', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
      };
      const response = await axios.get(
        `https://capypaybackend.onrender.com/api/yandex_gpt/${session?.user.id}`,
        { params }
      );

      console.log('Response data:', response.data);

      if (!response.data.analysis) {
        throw new Error('Ответ от сервера не содержит анализа');
      }

      setAnalysisResult(response.data.analysis);
      setNotification({ message: 'Анализ успешно получен!', type: 'success' });
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      setNotification({ message: `Ошибка: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center w-full h-full flex-col">
        <h1 className="font-bold text-primary text-2xl md:text-3xl xl:text-4xl mt-5">Вы не вошли в аккаунт</h1>
      </div>
    );
  }

  const formatAnalysis = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const isListItem = /^\d+\.\s/.test(line);
      return (
        <p key={index} className={isListItem ? 'ml-4' : ''}>
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex items-center w-full h-full flex-col space-y-7 mb-5 px-4">
      <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Рекомендации</h1>

      {notification.message && (
        <div
          className={`fixed top-5 right-5 z-50 alert shadow-lg animate-slide-in ${
            notification.type === 'error'
              ? 'alert-error'
              : notification.type === 'success'
              ? 'alert-success'
              : 'alert-info'
          }`}
        >
          <div>
            <span>{notification.message}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setNotification({ message: '', type: '' })}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3 px-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Начальная дата</span>
          </label>
          <input
            type="date"
            className="input input-bordered"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Конечная дата</span>
          </label>
          <input
            type="date"
            className="input input-bordered"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Категория</span>
          </label>
          <select
            className="select select-bordered"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="">Выберите категорию</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {chartData === null && tag === '' && (
        <>
          <p>Выберите дату и категорию</p>
        </>
      )}

      {chartData && tag && (
        <>
          <div className="flex items-center w-full px-2 md:w-2/3 h-max flex-col">
            <LineChart
              key="quantity"
              chartTitle={`Количество товаров (${tag})`}
              chartData={chartData?.quantity}
              xAxisLabel={'Дата покупки'}
              yAxisLabel={'Количество товаров'}
            />
          </div>
          <div className="flex items-center w-full px-2 md:w-2/3 h-max flex-col">
            <LineChart
              key="price"
              chartTitle={`Цена товаров (${tag})`}
              chartData={chartData?.price}
              xAxisLabel={'Дата покупки'}
              yAxisLabel={'Цена товаров'}
            />
          </div>
        </>
      )}

      <button
        type="button"
        className={`btn btn-primary btn-md py-10 md:btn-lg w-full md:w-2/3 ${loading ? 'loading' : ''}`}
        onClick={handleGetAnalysis}
        disabled={loading}
      >
        Получить общий анализ от YandexGPT (пробная функция)
      </button>

      {analysisResult ? (
        <div className="flex items-center bg-base-300 w-full md:w-2/3 h-max rounded-2xl flex-col mt-5 p-5">
          <h2 className="font-bold text-xl md:text-2xl mb-4">Результаты анализа</h2>
          <div className="text-justify md:text-lg">{formatAnalysis(analysisResult)}</div>
        </div>
      ) : (
        <div className="flex items-center bg-base-300 w-full md:w-2/3 h-max rounded-2xl flex-col mt-5 p-5">
          <p className="text-justify md:text-lg">
            Выберите даты и нажмите "Получить анализ", чтобы увидеть рекомендации.
          </p>
        </div>
      )}
    </div>
  );
}

export default Recommendations;