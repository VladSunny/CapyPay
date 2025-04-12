import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import axios from 'axios';
import LineChart from '../components/LineChart';

function Analysis() {
  const [session, setSession] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // Количество записей на странице

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
        // Загрузка данных для графиков
        const response = await axios.get(
          `https://capypaybackend.onrender.com/api/data/price-quantity/${session?.user.id}`
        );
        setChartData(response.data);

        // Загрузка истории покупок
        const { data: purchasesData, count, error } = await supabase
          .from('Payments')
          .select('*', { count: 'exact' })
          .eq('uuid', session?.user.id)
          .order('purchase_date', { ascending: false })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

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
  }, [session, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex items-center w-full h-full flex-col space-y-7 mb-5 px-4">
      <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Анализ покупок</h1>

      <div className="flex items-center w-full px-2 md:w-2/3 h-max flex-col">
        <h2 className="text-secondary text-2xl md:text-4xl font-extrabold">График количества</h2>
        <LineChart key="quantity" chartTitle="Количество товаров" chartData={chartData?.quantity} />
      </div>

      <div className="flex items-center w-full px-2 md:w-2/3 flex-col">
        <h2 className="text-secondary text-2xl md:text-4xl font-extrabold">График цены</h2>
        <LineChart key="price" chartTitle="Цена товаров" chartData={chartData?.price} />
      </div>

      <div className="flex items-center w-full px-2 md:w-2/3 flex-col bg-base-300 p-5 rounded-3xl">
        <h2 className="text-secondary text-2xl md:text-4xl font-extrabold mb-4">История покупок</h2>
        {purchases.length === 0 ? (
          <p className="text-gray-500">Нет данных для отображения</p>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Название товара</th>
                    <th>Количество</th>
                    <th>Цена</th>
                    <th>Дата покупки</th>
                    <th>Теги</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td>{purchase.product_name || '-'}</td>
                      <td>{purchase.quantity || 0}</td>
                      <td>{purchase.price ? `$${purchase.price.toFixed(2)}` : '-'}</td>
                      <td>
                        {purchase.purchase_date
                          ? new Date(purchase.purchase_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        {purchase.tags && purchase.tags.length > 0
                          ? purchase.tags.map((tag, index) => (
                              <span key={index} className="badge badge-primary mr-1">
                                {tag}
                              </span>
                            ))
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            <div className="flex justify-center mt-4 space-x-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Назад
              </button>
              <span className="self-center">
                Страница {currentPage} из {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Вперед
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analysis;