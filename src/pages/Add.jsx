import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import Papa from 'papaparse';
import { FaTimes, FaTag, FaBox, FaDollarSign, FaCalendarAlt, FaFileCsv, FaDownload } from 'react-icons/fa';
import '../styles/Add.css';

function Add() {
  const [session, setSession] = useState(null);
  // const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setCsvFile(null);
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setNotification({ message: 'Пожалуйста, выберите файл формата CSV.', type: 'error' });
      event.target.value = '';
      setCsvFile(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setNotification({ message: 'Файл слишком большой. Максимальный размер: 2MB.', type: 'error' });
      event.target.value = '';
      setCsvFile(null);
      return;
    }

    setNotification({ message: 'Файл успешно выбран!', type: 'success' });
    setCsvFile(file);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: 'Обработка...', type: 'info' });

    let totalRecordsAdded = 0;

    const isFormFilled = quantity && price && purchaseDate;
    if (isFormFilled) {
      const parsedQuantity = parseInt(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        setNotification({ message: 'Количество должно быть целым положительным числом.', type: 'error' });
        return;
      }

      const formRecord = {
        quantity: parsedQuantity,
        price: parseFloat(price),
        purchase_date: purchaseDate,
        tags: tags,
      };

      const { data, error } = await supabase.from('Payments').insert([formRecord]);

      if (error) {
        setNotification({ message: `Ошибка добавления покупки: ${error.message}`, type: 'error' });
        return;
      }

      totalRecordsAdded += 1;
    }

    if (csvFile) {
      Papa.parse(csvFile, {
        complete: async (result) => {
          try {
            const headers = result.data[0];
            const expectedHeaders = ['product_name', 'quantity', 'price', 'purchase_date', 'tags'];
            const headersMatch = expectedHeaders.every((header) => headers.includes(header));
            if (!headersMatch) {
              setNotification({
                message: 'CSV должен содержать заголовки: product_name, quantity, price, purchase_date, tags',
                type: 'error',
              });
              return;
            }

            const records = result.data.slice(1).map((row) => {
              const record = {};
              headers.forEach((header, index) => {
                record[header] = row[index] || '';
              });

              const rawQuantity = record.quantity;
              const parsedQuantity = parseInt(rawQuantity);
              if (rawQuantity && (isNaN(parsedQuantity) || parsedQuantity.toString() !== rawQuantity)) {
                throw new Error(`Некорректное значение количества: "${rawQuantity}". Должно быть целое число.`);
              }

              let tagsArray = [];
              if (record.tags) {
                const tagsStr = record.tags.replace(/^{|}$/g, '');
                tagsArray = tagsStr ? tagsStr.split(',').map((tag) => tag.trim()) : [];
              }

              return {
                product_name: record.product_name || '',
                quantity: parsedQuantity || 0,
                price: parseFloat(record.price) || 0,
                purchase_date: record.purchase_date || '',
                tags: tagsArray,
              };
            });

            const validRecords = records.filter(
              (record) =>
                record.product_name &&
                record.quantity > 0 &&
                record.price >= 0 &&
                record.purchase_date
            );

            if (validRecords.length === 0) {
              setNotification({ message: 'В CSV нет действительных записей.', type: 'error' });
              return;
            }

            const { data, error } = await supabase.from('Payments').insert(validRecords);

            if (error) {
              setNotification({ message: `Ошибка загрузки CSV: ${error.message}`, type: 'error' });
              return;
            }

            totalRecordsAdded += validRecords.length;

            setCsvFile(null);
            document.querySelector('input[type="file"]').value = '';
            setNotification({
              message: `Успешно добавлено ${totalRecordsAdded} записей!`,
              type: 'success',
            });
          } catch (err) {
            setNotification({ message: `Ошибка обработки CSV: ${err.message}`, type: 'error' });
          }
        },
        header: false,
        skipEmptyLines: true,
        error: () => {
          setNotification({ message: 'Ошибка чтения CSV-файла.', type: 'error' });
        },
      });
    } else {
      if (isFormFilled) {
        setNotification({
          message: `Успешно добавлено ${totalRecordsAdded} записей!`,
          type: 'success',
        });
      } else {
        setNotification({ message: 'Заполните форму или выберите CSV-файл.', type: 'error' });
        return;
      }
    }

    if (isFormFilled) {
      setQuantity('');
      setPrice('');
      setPurchaseDate('');
      setTags([]);
      setTagInput('');
    }
  };

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

  if (!session) {
    return (
      <div className="flex items-center w-full h-full flex-col">
        <h1 className="font-bold text-primary text-2xl md:text-3xl xl:text-4xl mt-5">Войдите в аккаунт</h1>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full h-full flex-col px-4">
      <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5 mb-8">Добавить покупку</h1>

      {notification.message && (
        <div
          className={`fixed top-5 right-5 z-50 alert shadow-lg animate-slide-in ${
            notification.type === 'error' ? 'alert-error' : notification.type === 'success' ? 'alert-success' : 'alert-info'
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

      <form
        onSubmit={handleSubmit}
        className="z-0 bg-base-100 mx-2 md:w-5/6 xl:w-1/3 p-6 rounded-2xl shadow-xl mt-5 border border-base-300 transition-all duration-300 hover:shadow-2xl"
      >
        <div className="space-y-6">
          {/* <div className="flex items-center space-x-3">
            <FaBox className="text-primary text-xl" />
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Название товара"
              className="input input-bordered w-full focus:ring-2 focus:ring-primary"
            />
          </div> */}

          <div className="flex items-center space-x-3">
            <FaBox className="text-primary text-xl" />
            <input
              type="number"
              step="1"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="Количество"
              className="input input-bordered w-full focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center space-x-3">
            <FaDollarSign className="text-primary text-xl" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Цена (общая)"
              className="input input-bordered w-full focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center space-x-3">
            <FaCalendarAlt className="text-primary text-xl" />
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="input input-bordered w-full focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-start space-x-3">
            <FaTag className="text-primary text-xl mt-2" />
            <div className="w-full">
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="badge badge-primary badge-lg animate-fade-in cursor-pointer transition-transform hover:scale-105"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} <FaTimes className="ml-1" />
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Введите тег и нажмите Enter, запятую или пробел"
                className="input input-bordered w-full focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaFileCsv className="text-primary text-xl" />
            <div className="w-full">
              <input
                type="file"
                accept=".csv, text/csv"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full focus:ring-2 focus:ring-primary"
              />
              <div className="flex items-center space-x-2 mt-2">
                <label className="text-sm text-gray-500">Максимальный размер: 2MB</label>
                <a
                  href="/sample_test.csv"
                  download
                  className="btn btn-ghost btn-sm text-primary hover:bg-primary hover:text-white"
                >
                  <FaDownload className="mr-1" />
                  Скачать пример CSV
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="btn btn-primary w-full md:w-1/2 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Сохранить покупку
          </button>
        </div>
      </form>
    </div>
  );
}

export default Add;