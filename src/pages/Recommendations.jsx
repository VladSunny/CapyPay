import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

function Recommendations() {
  const [session, setSession] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

  const handleGetAnalysis = async () => {
    if (!startDate || !endDate) {
      setNotification({ message: 'Пожалуйста, выберите начальную и конечную дату', type: 'error' });
      return;
    }

    print(startDate, endDate);

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

      // Проверяем, есть ли поле analysis в ответе
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

  // Форматируем текст анализа, чтобы поддерживать списки
  const formatAnalysis = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      // Проверяем, начинается ли строка с числа и точки (например, "1. ")
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
      </div>

      <button
        className={`btn btn-primary w-full md:w-2/3 ${loading ? 'loading' : ''}`}
        onClick={handleGetAnalysis}
        disabled={loading}
      >
        Получить общий анализ от YandexGPT
      </button>

      {analysisResult ? (
        <div className="flex items-center bg-base-300 w-full md:w-2/3 h-max rounded-2xl flex-col mt-5 p-5">
          <h2 className="font-bold text-xl md:text-2xl mb-4">Результаты анализа</h2>
          <div className="text-justify md:text-lg">{formatAnalysis(analysisResult)}</div>
        </div>
      ) : (
        <div className="flex items-center bg-base-300 w-full md:w-2/3 h-max rounded-2xl flex-col mt-5 p-5">
          <p className="text-justify md:text-lg">Выберите даты и нажмите "Получить анализ", чтобы увидеть рекомендации.</p>
        </div>
      )}
    </div>
  );
}

export default Recommendations;