import { useState, useEffect } from 'react';
import supabase from '../supabase-client';

function Add() {
    const [session, setSession] = useState(null)

    // Состояния для полей ввода
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [tags, setTags] = useState([]); // Новое состояние для тегов
    const [tagInput, setTagInput] = useState(''); // Временное состояние для ввода тегов

    // Функция для добавления тега
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

    // Функция для удаления тега
    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    // Функция для обработки отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();
        // Здесь можно добавить логику для сохранения данных, например, в базу данных или localStorage
        console.log('Новая покупка:', { productName, quantity, price, purchaseDate, tags });

        // Очистка полей после отправки
        setProductName('');
        setQuantity('');
        setPrice('');
        setPurchaseDate('');
        setTags([]);
        setTagInput('');
    };

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

    if (!session) {
        return (
            <div className="flex items-center w-full h-full flex-col">
                <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Войдите в аккаунт</h1>
            </div>
        );
    }

    return (
        <>
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
                            required
                            />
                        </td>
                    </tr>

                    <tr>
                        <td className="text-center">Количество</td>
                        <td>
                            <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Введите количество"
                            className="input input-bordered w-full"
                            required
                            />
                        </td>
                    </tr>

                    <tr>
                        <td className="text-center">Цена</td>
                        <td>
                            <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Введите цену"
                            className="input input-bordered w-full"
                            required
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
                            required
                            />
                        </td>
                    </tr>

                    <tr>
                    <td className="text-center sm:text-left">Теги</td>
                    <td>
                        <div className="flex flex-col space-y-2">
                        {/* Отображение текущих тегов */}
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
                        {/* Поле ввода тегов */}
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={addTag}
                            placeholder="Введите тег и нажмите Enter, запятую или пробел"
                            className="input input-bordered w-full sm:w-auto"
                        />
                        </div>
                    </td>
                    </tr>
                </tbody>
                </table>

                <div className="flex justify-center mt-4">
                <button type="submit" className="btn btn-primary w-full md:w-auto">
                    Сохранить покупку
                </button>
                </div>
            </form>
        </div>
        </>
    );
}

export default Add;