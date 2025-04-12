import { useState, useEffect } from 'react';
import supabase from '../supabase-client';
import Papa from 'papaparse';

function Add() {
    const [session, setSession] = useState(null);
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [csvFile, setCsvFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

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
            setUploadStatus('Пожалуйста, выберите файл формата CSV.');
            event.target.value = '';
            setCsvFile(null);
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setUploadStatus('Файл слишком большой. Максимальный размер: 2MB.');
            event.target.value = '';
            setCsvFile(null);
            return;
        }

        setUploadStatus('');
        setCsvFile(file);
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        // Проверяем, что введено целое число или пустая строка
        if (value === '' || /^[0-9]+$/.test(value)) {
            setQuantity(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploadStatus('Обработка...');

        let totalRecordsAdded = 0;

        // 1. Обработка данных формы (если заполнены)
        const isFormFilled = productName && quantity && price && purchaseDate;
        if (isFormFilled) {
            const parsedQuantity = parseInt(quantity);
            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                setUploadStatus('Ошибка: Количество в форме должно быть целым положительным числом.');
                return;
            }

            const formRecord = {
                product_name: productName,
                quantity: parsedQuantity,
                price: parseFloat(price),
                purchase_date: purchaseDate,
                tags: tags,
            };

            const { data, error } = await supabase.from('Payments').insert([formRecord]);

            if (error) {
                console.error('Ошибка при добавлении покупки из формы:', error);
                setUploadStatus(`Ошибка добавления покупки из формы: ${error.message}`);
                return;
            }

            totalRecordsAdded += 1;
        }

        // 2. Обработка CSV-файла (если выбран)
        if (csvFile) {
            Papa.parse(csvFile, {
                complete: async (result) => {
                    try {
                        const headers = result.data[0];
                        const expectedHeaders = ['product_name', 'quantity', 'price', 'purchase_date', 'tags'];
                        const headersMatch = expectedHeaders.every((header) => headers.includes(header));
                        if (!headersMatch) {
                            setUploadStatus('Ошибка: CSV должен содержать заголовки: product_name, quantity, price, purchase_date, tags');
                            return;
                        }

                        const records = result.data.slice(1).map((row) => {
                            const record = {};
                            headers.forEach((header, index) => {
                                record[header] = row[index] || '';
                            });

                            // Проверка quantity на целое число
                            const rawQuantity = record.quantity;
                            const parsedQuantity = parseInt(rawQuantity);
                            if (rawQuantity && (isNaN(parsedQuantity) || parsedQuantity.toString() !== rawQuantity)) {
                                throw new Error(`Некорректное значение количества: "${rawQuantity}". Должно быть целое число.`);
                            }

                            // Обработка тегов в формате "{tag1,tag2,tag3}"
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
                            setUploadStatus('Ошибка: в CSV нет действительных записей.');
                            return;
                        }

                        console.log('Valid Records:', validRecords);

                        const { data, error } = await supabase.from('Payments').insert(validRecords);

                        if (error) {
                            console.error('Ошибка при загрузке CSV:', error);
                            setUploadStatus(`Ошибка загрузки CSV: ${error.message}`);
                            return;
                        }

                        totalRecordsAdded += validRecords.length;

                        setCsvFile(null);
                        document.querySelector('input[type="file"]').value = '';
                        setUploadStatus(`Успешно добавлено ${totalRecordsAdded} записей!`);
                    } catch (err) {
                        console.error('Ошибка обработки CSV:', err);
                        setUploadStatus(`Ошибка обработки CSV: ${err.message}`);
                    }
                },
                header: false,
                skipEmptyLines: true,
                error: () => {
                    setUploadStatus('Ошибка чтения CSV-файла.');
                },
            });
        } else {
            if (isFormFilled) {
                setUploadStatus(`Успешно добавлено ${totalRecordsAdded} записей!`);
            } else {
                setUploadStatus('Заполните форму или выберите CSV-файл.');
                return;
            }
        }

        // Очистка формы после успешной обработки
        if (isFormFilled) {
            setProductName('');
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

    if (!session) {
        return (
            <div className="flex items-center w-full h-full flex-col">
                <h1 className="font-bold text-primary text-2xl md:text-3xl xl:text-4xl mt-5">Войдите в аккаунт</h1>
            </div>
        );
    }

    return (
        <div className="flex items-center w-full h-full flex-col">
            <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Добавить покупку</h1>

            <form onSubmit={handleSubmit} className="z-0 border mx-2 md:w-5/6 xl:w-1/3 p-4 rounded-lg shadow-md mt-5">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th className="text-center">Поле</th>
                            <th className="text-center">Значение</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-center">Название товара</td>
                            <td>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder="Введите название товара"
                                    className="input input-bordered w-full"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="text-center">Количество</td>
                            <td>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    placeholder="Введите количество"
                                    className="input input-bordered w-full"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="text-center">Цена (общая)</td>
                            <td>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="Введите цену"
                                    className="input input-bordered w-full"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="text-center">Дата покупки</td>
                            <td>
                                <input
                                    type="date"
                                    value={purchaseDate}
                                    onChange={(e) => setPurchaseDate(e.target.value)}
                                    className="input input-bordered w-full"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="text-center">Теги</td>
                            <td>
                                <div className="flex flex-col space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="badge badge-primary badge-outline cursor-pointer"
                                                onClick={() => removeTag(tag)}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={addTag}
                                        placeholder="Введите тег и нажмите Enter, запятую или пробел"
                                        className="input input-bordered w-full"
                                    />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Можно загрузить свои покупки в csv формате</legend>
                    <input
                        type="file"
                        accept=".csv, text/csv"
                        onChange={handleFileChange}
                        className="file-input"
                    />
                    <label className="fieldset-label">Max size 2MB</label>
                </fieldset>

                {uploadStatus && (
                    <div className="mt-4 text-center">
                        <p className={uploadStatus.includes('Ошибка') ? 'text-red-500' : 'text-green-500'}>
                            {uploadStatus}
                        </p>
                    </div>
                )}

                <div className="flex justify-center mt-4">
                    <button type="submit" className="btn btn-primary w-full md:w-auto">
                        Сохранить покупку
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Add;