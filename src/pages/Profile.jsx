import { useState, useEffect } from 'react';
import supabase from '../supabase-client';

function Profile() {
  const [session, setSession] = useState(null);
  const [profileData, setProfileData] = useState({
    gender: '',
    age: '',
    salary: '',
  });
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    // Получение сессии
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Загрузка данных профиля
    const fetchProfile = async () => {
      if (session) {
        try {
          const { data, error } = await supabase
            .from('Profiles')
            .select('gender, age, salary')
            .eq('uuid', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (data) {
            setProfileData({
              gender: data.gender || '',
              age: data.age || '',
              salary: data.salary || '',
            });
          }
        } catch (err) {
          console.error('Ошибка загрузки профиля:', err);
          setUpdateStatus(`Ошибка: ${err.message}`);
        }
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateStatus('Обработка...');

    // Валидация
    const parsedAge = parseInt(profileData.age);
    const parsedSalary = parseFloat(profileData.salary);

    if (profileData.age && (isNaN(parsedAge) || parsedAge < 0)) {
      setUpdateStatus('Ошибка: Возраст должен быть положительным числом.');
      return;
    }

    if (profileData.salary && (isNaN(parsedSalary) || parsedSalary < 0)) {
      setUpdateStatus('Ошибка: Зарплата должна быть положительным числом.');
      return;
    }

    try {
      const updatedProfile = {
        uuid: session.user.id,
        gender: profileData.gender,
        age: profileData.age ? parsedAge : null,
        salary: profileData.salary ? parsedSalary : null
      };

      const { error } = await supabase
        .from('Profiles')
        .upsert([updatedProfile], { onConflict: 'uuid' });

      if (error) {
        throw error;
      }

      setUpdateStatus('Профиль успешно обновлен!');
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
      setUpdateStatus(`Ошибка: ${err.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center w-full h-full flex-col">
        <h1 className="font-bold text-primary text-2xl md:text-3xl xl:text-4xl mt-5">Подождите...</h1>
        <span className="loading loading-dots loading-xl"></span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center w-full h-full flex-col">
        <h1 className="font-bold text-primary text-2xl md:text-3xl xl:text-4xl mt-5">Войдите в аккаунт</h1>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full h-full flex-col">
      <h1 className="font-bold text-primary text-3xl md:text-5xl xl:text-6xl mt-5">Профиль</h1>

      <div className="flex items-center w-full md:w-5/6 xl:w-1/3 flex-col mt-5 p-5">
        <h2 className="text-secondary text-2xl md:text-3xl font-extrabold mb-4">Информация об аккаунте</h2>
        <p className="text-lg">Email: {session.user.email}</p>
        {/* <p className="text-lg">ID пользователя: {session.user.id}</p> */}
      </div>

      <form
        onSubmit={handleSubmit}
        className="z-0 border mx-2 md:w-5/6 xl:w-1/3 p-4 rounded-lg shadow-md mt-5"
      >
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="text-center">Поле</th>
              <th className="text-center">Значение</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center">Пол</td>
              <td>
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Выберите пол</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                  {/* <option value="other">Другое</option> */}
                </select>
              </td>
            </tr>
            <tr>
              <td className="text-center">Возраст</td>
              <td>
                <input
                  type="number"
                  name="age"
                  value={profileData.age}
                  onChange={handleInputChange}
                  placeholder="Введите возраст"
                  className="input input-bordered w-full"
                  min="0"
                  step="1"
                />
              </td>
            </tr>
            <tr>
              <td className="text-center">Месячная зарплата</td>
              <td>
                <input
                  type="number"
                  name="salary"
                  value={profileData.salary}
                  onChange={handleInputChange}
                  placeholder="Введите зарплату"
                  className="input input-bordered w-full"
                  min="0"
                  step="0.01"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {updateStatus && (
          <div className="mt-4 text-center">
            <p className={updateStatus.includes('Ошибка') ? 'text-red-500' : 'text-green-500'}>
              {updateStatus}
            </p>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button type="submit" className="btn btn-primary w-full md:w-auto">
            Сохранить изменения
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;