import { FaTimes } from 'react-icons/fa';

function PurchaseHistory({
  purchases,
  currentPage,
  totalPages,
  handlePageChange,
  handleDelete,
  setNotification,
  notification,
}) {
  return (
    <div className="flex items-center w-full px-2 md:w-2/3 flex-col bg-base-300 p-5 rounded-3xl">
      {/* Уведомления */}
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
                  <th></th> {/* Колонка для кнопки удаления */}
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
                    <td>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleDelete(purchase.id)}
                        title="Удалить покупку"
                      >
                        <FaTimes />
                      </button>
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
  );
}

export default PurchaseHistory;