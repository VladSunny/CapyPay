import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import axios from 'axios';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart'; // Импортируем BarChart
import { FaTimes } from 'react-icons/fa';
import PurchaseHistory from '../components/PurchaseHistory';
import PieChart from '../components/charts/PieChart';

function Analysis() {
  const [session, setSession] = useState(null);
  const [lineBarChartData, setLineBarChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartType, setChartType] = useState('line'); // Новое состояние для типа графика
  const itemsPerPage = 10;

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
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await axios.get(
          `https://capypaybackend.onrender.com/api/data/price-quantity/line-chart/${session?.user.id}`,
          { params }
        );
        setLineBarChartData(response.data);

        const response2 = await axios.get(
          `https://capypaybackend.onrender.com/api/data/price-quantity/pie-chart/${session?.user.id}`,
          { params }
        );
        setPieChartData(response2.data);

        let query = supabase
          .from('Payments')
          .select('*', { count: 'exact' })
          .eq('uuid', session?.user.id)
          .order('purchase_date', { ascending: false });

        if (startDate) query = query.gte('purchase_date', startDate);
        if (endDate) query = query.lte('purchase_date', endDate);

        const { data: purchasesData, count, error } = await query.range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1
        );

        if (error) throw error;

        setPurchases(purchasesData || []);
        setTotalPages(Math.ceil(count / itemsPerPage));
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
  }, [session, currentPage, startDate, endDate]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id) => {
    try {
      setNotification({ message: 'Удаление...', type: 'info' });
      const { error } = await supabase.from('Payments').delete().eq('id', id).eq('uuid', session?.user.id);

      if (error) throw error;

      setPurchases(purchases.filter((purchase) => purchase.id !== id));
      setNotification({ message: 'Покупка успешно удалена!', type: 'success' });

      let query = supabase
        .from('Payments')
        .select('*', { count: 'exact' })
        .eq('uuid', session?.user.id);
      if (startDate) query = query.gte('purchase_date', startDate);
      if (endDate) query = query.lte('purchase_date', endDate);

      const { count } = await query;
      setTotalPages(Math.ceil(count / itemsPerPage));

      if (purchases.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setNotification({ message: `Ошибка удаления: ${err.message}`, type: 'error' });
    }
  };

  if (!session) {
    return (
      <div className="flex items-center w-full h-full flex-col">
        <h1 className="font-bold text-primary text-2xl md:text-3xl xl:text-4xl mt-5">Вы не вошли в аккаунт</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center w-full h-full flex-col">
        <h1 className="font-bold text-primary text-2xl md:text-3xl xl:text-4xl mt-5">Подождите...</h1>
        <span className="loading loading-dots loading-xl"></span>
        <div className="flex items-center w-2/3 h-1/2 flex-col skeleton"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full h-full flex-col space-y-7 mb-5 px-4">
      <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Анализ покупок</h1>

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

      {/* Переключатель типа графика */}
      <div className="flex gap-4 w-full md:w-2/3 px-2">
        <button
          className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setChartType('line')}
        >
          Линейный график
        </button>
        <button
          className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setChartType('bar')}
        >
          Столбчатый график
        </button>
      </div>

      {lineBarChartData !== null && (
        <>
          <div className="flex items-center w-full px-2 md:w-2/3 h-max flex-col">
            {chartType === 'line' ? (
              <LineChart key="quantity" chartTitle="Количество товаров" chartData={lineBarChartData?.quantity} />
            ) : (
              <BarChart key="quantity" chartTitle="Количество товаров" chartData={lineBarChartData?.quantity} />
            )}
          </div>

          <div className="flex items-center w-full px-2 md:w-2/3 flex-col">
            {chartType === 'line' ? (
              <LineChart key="price" chartTitle="Цена товаров" chartData={lineBarChartData?.price} />
            ) : (
              <BarChart key="price" chartTitle="Цена товаров" chartData={lineBarChartData?.price} />
            )}
          </div>
        </>
      )}

      {pieChartData !== null && (
        <>
          <div className="flex items-center justify-center w-full h-max flex-col">
            <div className="flex items-center w-full md:w-1/3 px-2 h-max flex-col mb-5">
              <PieChart chartTitle="Количество товаров" chartData={pieChartData?.quantity} />
            </div>

            <div className="flex items-center w-full md:w-1/3 h-max px-2 flex-col">
              <PieChart chartTitle="Цена товаров" chartData={pieChartData?.price} />
            </div>
          </div>
        </>
      )}

      <PurchaseHistory
        purchases={purchases}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        handleDelete={handleDelete}
        setNotification={setNotification}
        notification={notification}
      />
    </div>
  );
}

export default Analysis;