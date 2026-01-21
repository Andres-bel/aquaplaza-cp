import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Copy, Check, Calculator, User, Briefcase } from 'lucide-react';

// Компонент: Элемент формы товара
const ProductRow = ({ item, onChange, onRemove, index }) => {
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-start mb-2">
        <input
          type="text"
          placeholder="Название товара (напр. Смеситель Grohe)"
          value={item.name}
          onChange={(e) => onChange(index, 'name', e.target.value)}
          className="w-full font-medium text-gray-800 placeholder-gray-400 bg-transparent border-none focus:ring-0 p-0 text-sm"
        />
        <button 
          onClick={() => onRemove(index)}
          className="text-gray-400 hover:text-red-500 ml-2 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-400 block mb-1">Цена (₽)</label>
          <input
            type="number"
            value={item.price}
            onChange={(e) => onChange(index, 'price', parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-50 rounded-lg px-2 py-1.5 text-sm border-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="w-20">
          <label className="text-xs text-gray-400 block mb-1">Кол-во</label>
          <input
            type="number"
            value={item.qty}
            onChange={(e) => onChange(index, 'qty', parseInt(e.target.value) || 1)}
            className="w-full bg-gray-50 rounded-lg px-2 py-1.5 text-sm border-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="w-24 text-right">
          <label className="text-xs text-gray-400 block mb-1">Сумма</label>
          <div className="py-1.5 text-sm font-semibold text-gray-700">
            {(item.price * item.qty).toLocaleString()} ₽
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('editor'); // editor | preview
  const [copied, setCopied] = useState(false);
  const [isTg, setIsTg] = useState(false);
  
  // Данные КП
  const [clientName, setClientName] = useState('');
  const [managerName, setManagerName] = useState('Менеджер Aquaplaza');
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState([
    { name: 'Смеситель для раковины Grohe Euroeco', price: 8500, qty: 1 },
    { name: 'Инсталляция Geberit Duofix', price: 24990, qty: 1 }
  ]);

  // Инициализация Telegram WebApp
  useEffect(() => {
    // Проверяем наличие объекта Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setIsTg(true);
      
      // Сообщаем телеграму, что приложение готово
      tg.ready();
      
      // Разворачиваем на всю высоту
      try {
        tg.expand();
      } catch (e) {
        console.error('Expand failed', e);
      }

      // Авто-заполнение имени менеджера из данных телеграма
      if (tg.initDataUnsafe?.user?.first_name) {
        setManagerName(`${tg.initDataUnsafe.user.first_name} (Aquaplaza)`);
      }

      // Настройка цветов под тему телеграма (опционально)
      // document.body.style.backgroundColor = tg.themeParams.bg_color;
    }
  }, []);

  // Вычисления
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal - (subtotal * (discount / 100));

  // Управление товарами
  const addItem = () => {
    setItems([...items, { name: '', price: 0, qty: 1 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Генерация текста для буфера обмена
  const generateTextCP = () => {
    let text = `📄 *Коммерческое предложение*\n`;
    text += `Клиент: ${clientName || 'Уважаемый клиент'}\n`;
    text += `Менеджер: ${managerName}\n\n`;
    
    items.forEach((item, i) => {
      text += `${i + 1}. ${item.name || 'Товар'}\n`;
      text += `   ${item.qty} шт. х ${item.price.toLocaleString()} ₽ = ${(item.price * item.qty).toLocaleString()} ₽\n`;
    });
    
    text += `\n------------------\n`;
    if (discount > 0) text += `Скидка: ${discount}%\n`;
    text += `💰 *ИТОГО: ${total.toLocaleString()} ₽*\n\n`;
    text += `С уважением, команда Aquaplaza\nТел: +7 (495) 275-31-31`;
    
    return text;
  };

  const handleCopy = () => {
    const text = generateTextCP();
    
    // Пытаемся использовать нативный clipboard API
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      
      // Если мы в телеграме, можно также использовать haptic feedback (вибрацию)
      if (window.Telegram?.WebApp?.HapticFeedback) {
         window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Clipboard failed', err);
      // Фолбэк для старых версий webview, если нужно
      alert("Не удалось скопировать автоматически. Пожалуйста, выделите текст и скопируйте вручную.");
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20 selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
            <Calculator size={20} />
            КП Aquaplaza
          </h1>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'editor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Редактор
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Просмотр
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        
        {activeTab === 'editor' ? (
          <div className="space-y-6">
            
            {/* Блок Клиента */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={14} /> Данные заказа
              </h2>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Клиент</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Имя или название компании"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Менеджер</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  />
                </div>
              </div>
            </section>

            {/* Список товаров */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase size={14} /> Товары ({items.length})
                </h2>
                <button 
                  onClick={addItem}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Добавить
                </button>
              </div>
              
              <div className="space-y-1">
                {items.map((item, index) => (
                  <ProductRow 
                    key={index} 
                    item={item} 
                    index={index} 
                    onChange={updateItem} 
                    onRemove={removeItem} 
                  />
                ))}
              </div>
            </section>

            {/* Итого и Скидка */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 text-sm">Подытог</span>
                <span className="font-medium">{subtotal.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 text-sm">Скидка (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-right text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Итого</span>
                <span className="text-xl font-bold text-blue-600">{total.toLocaleString()} ₽</span>
              </div>
            </section>

          </div>
        ) : (
          /* PREVIEW MODE */
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6 relative">
              {/* Decorative top bar */}
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Коммерческое предложение</h2>
                    <p className="text-sm text-gray-500">Aquaplaza-Online</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Дата</div>
                    <div className="text-sm font-medium">{new Date().toLocaleDateString('ru-RU')}</div>
                  </div>
                </div>

                <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-400 block uppercase">Клиент</span>
                      <span className="font-semibold text-gray-800">{clientName || '---'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block uppercase">Менеджер</span>
                      <span className="font-semibold text-gray-800">{managerName}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-500 font-normal pl-1">Наименование</th>
                        <th className="text-right py-2 text-gray-500 font-normal">Кол-во</th>
                        <th className="text-right py-2 text-gray-500 font-normal pr-1">Сумма</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-3 pl-1">
                            <div className="font-medium text-gray-800">{item.name || 'Товар без названия'}</div>
                          </td>
                          <td className="py-3 text-right text-gray-600">x{item.qty}</td>
                          <td className="py-3 text-right font-medium pr-1">{(item.price * item.qty).toLocaleString()} ₽</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                   {discount > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Скидка ({discount}%)</span>
                      <span>-{(subtotal * (discount/100)).toLocaleString()} ₽</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-gray-800 pt-2">
                    <span>Итого к оплате:</span>
                    <span>{total.toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 text-center">
                <p className="text-xs text-gray-500">
                  Спасибо за обращение в Aquaplaza! <br/>
                  Цены действительны в течение 3 дней.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className={`w-full py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 ${
                copied 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Скопировано!' : 'Скопировать текст для чата'}
            </button>
             <p className="text-center text-xs text-gray-400 mt-3">
                Нажмите, чтобы скопировать и отправить клиенту
             </p>
          </div>
        )}
      </div>

      {/* Floating Action Button (Only in Editor) */}
      {activeTab === 'editor' && (
        <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto pointer-events-none">
          <button
            onClick={() => setActiveTab('preview')}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl shadow-lg shadow-blue-200 font-semibold flex items-center justify-center gap-2 pointer-events-auto hover:bg-blue-700 transition-colors active:scale-95"
          >
            <FileText size={20} />
            Сформировать КП ({total.toLocaleString()} ₽)
          </button>
        </div>
      )}
    </div>
  );
}
