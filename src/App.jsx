import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, FileText, Copy, Check, Calculator, 
  User, Briefcase, Search, ArrowRight, Package, X,
  Sparkles, Percent, Wifi, RefreshCw
} from 'lucide-react';

// --- НАСТРОЙКИ ---
const APP_VERSION = "4.2"; 
const API_URL = ''; 

// --- АВТО-ПОДКЛЮЧЕНИЕ СТИЛЕЙ (Tailwind CDN) ---
// Это исправит "ужасный вид", если стили не были настроены
const useTailwindLoader = () => {
  useEffect(() => {
    if (!document.getElementById('tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);
};

// --- КОМПОНЕНТЫ ---

const ProductRow = ({ item, onUpdate, onRemove, index }) => {
  const finalPrice = item.price * (1 - (item.discount || 0) / 100);
  const totalItemSum = finalPrice * item.qty;

  return (
    <div className="group bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Верхняя строка: Название */}
      <div className="flex justify-between items-start gap-3 mb-2">
        <div className="flex-1 min-w-0">
           {item.sku && (
             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide mb-1 inline-flex items-center gap-1 ${item.isAiGenerated ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-500'}`}>
               #{item.sku}
               {item.isAiGenerated && <Sparkles size={8} />}
             </span>
           )}
           <textarea
             rows={item.name.length > 30 ? 2 : 1}
             placeholder="Название товара..."
             value={item.name}
             onChange={(e) => onUpdate(index, 'name', e.target.value)}
             className="w-full text-sm font-medium text-gray-800 placeholder-gray-300 bg-transparent border-none focus:ring-0 p-0 resize-none leading-tight"
           />
        </div>
        <button 
          onClick={() => onRemove(index)}
          className="text-gray-300 hover:text-red-500 p-1.5 -mr-1 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      {/* Нижняя строка: Цифры */}
      <div className="flex items-center gap-2 bg-gray-50/80 p-2 rounded-lg text-xs sm:text-sm">
        <div className="flex-1 relative min-w-[60px]">
          <span className="text-[9px] text-gray-400 block mb-0.5">Цена</span>
          <input
            type="number"
            value={item.price === 0 ? '' : item.price}
            onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full bg-transparent font-semibold text-gray-700 border-none focus:ring-0 p-0"
          />
        </div>
        
        <div className="w-px h-6 bg-gray-200"></div>
        
        <div className="w-12 text-center">
          <span className="text-[9px] text-gray-400 block mb-0.5">Скидка%</span>
          <input
            type="number"
            placeholder="-"
            value={item.discount || ''}
            onChange={(e) => onUpdate(index, 'discount', parseFloat(e.target.value) || 0)}
            className="w-full bg-transparent text-center font-semibold text-orange-500 border-none focus:ring-0 p-0 placeholder-gray-300"
          />
        </div>
        
        <div className="w-px h-6 bg-gray-200"></div>
        
        <div className="w-10 text-center">
          <span className="text-[9px] text-gray-400 block mb-0.5">Шт</span>
          <input
            type="number"
            value={item.qty}
            onChange={(e) => onUpdate(index, 'qty', parseInt(e.target.value) || 1)}
            className="w-full bg-transparent text-center font-semibold text-gray-700 border-none focus:ring-0 p-0"
          />
        </div>
        
        <div className="min-w-[70px] text-right pl-2 border-l border-transparent">
           <span className="text-[9px] text-gray-400 block mb-0.5">Сумма</span>
           <div className="font-bold text-blue-600 leading-none">{totalItemSum.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  useTailwindLoader(); // <--- МАГИЯ ЗДЕСЬ (Загружает стили)

  const [activeTab, setActiveTab] = useState('editor');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [clientName, setClientName] = useState('');
  const [managerName, setManagerName] = useState('Менеджер Aquaplaza');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [items, setItems] = useState([
    { sku: '32843000', name: 'Смеситель для кухни Grohe (Пример)', price: 12400, qty: 1, discount: 0, isAiGenerated: true }
  ]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      try { tg.expand(); } catch (e) {}
      if (tg.initDataUnsafe?.user?.first_name) {
        setManagerName(`${tg.initDataUnsafe.user.first_name} (Aquaplaza)`);
      }
    }
  }, []);

  // --- УМНЫЙ ПОИСК ---
  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    const cleanSku = searchQuery.trim();

    try {
      let foundProduct = null;
      if (API_URL) {
        try {
          const response = await fetch(`${API_URL}?sku=${cleanSku}`);
          const data = await response.json();
          if (data && (data.found || data.name)) {
            foundProduct = {
              sku: data.sku || cleanSku,
              name: data.name,
              price: parseFloat(data.price) || 0,
              qty: 1,
              discount: 0,
              isAiGenerated: false 
            };
          }
        } catch (err) { console.log("API unavailable"); }
      }

      if (!foundProduct) {
        await new Promise(r => setTimeout(r, 600));
        foundProduct = { 
          sku: cleanSku, 
          name: `Товар арт. ${cleanSku} (Введите название)`, 
          price: 0, 
          qty: 1, 
          discount: 0,
          isAiGenerated: true 
        };
        if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      } else {
        if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

      setItems([...items, foundProduct]);
      setShowSearchModal(false);
      setSearchQuery('');
    } catch (error) {
      alert("Ошибка поиска.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualAdd = () => {
    setItems([...items, { sku: '', name: '', price: 0, qty: 1, discount: 0 }]);
    setShowSearchModal(false);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };
  
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.price * (1 - (item.discount || 0) / 100);
    return sum + (itemPrice * item.qty);
  }, 0);

  const total = subtotal * (1 - globalDiscount / 100);

  const copyToClipboard = () => {
    const date = new Date().toLocaleDateString('ru-RU');
    let text = `🌊 *Aquaplaza* | КП от ${date}\n`;
    if (clientName) text += `👤 Клиент: ${clientName}\n`;
    text += `\n`;
    
    items.forEach((item, i) => {
      const itemPrice = item.price * (1 - (item.discount || 0) / 100);
      const totalItem = itemPrice * item.qty;
      text += `${i + 1}. ${item.name}\n`;
      if (item.sku) text += `   Арт: ${item.sku}\n`;
      if (item.discount > 0) text += `   Цена: ${item.price.toLocaleString()} - ${item.discount}% = ${itemPrice.toLocaleString()} ₽\n`;
      text += `   ${item.qty} шт × ${itemPrice.toLocaleString()} = ${totalItem.toLocaleString()} ₽\n\n`;
    });
    
    text += `------------------\n`;
    if (globalDiscount > 0) text += `Доп. скидка на чек: ${globalDiscount}%\n`;
    text += `💎 *ИТОГО: ${total.toLocaleString()} ₽*\n\n`;
    text += `📞 Ваш менеджер: ${managerName}`;

    let success = false;
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      success = document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (err) { success = false; }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
       alert("Скопируйте вручную");
    }
  };

  const handleReload = () => window.location.reload();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 selection:bg-blue-100">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md px-5 pt-12 pb-4 shadow-sm sticky top-0 z-20 border-b border-slate-100">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              КП Менеджер
              <button onClick={handleReload} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-slate-200">
                 v{APP_VERSION} <RefreshCw size={8}/>
              </button>
            </h1>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['editor', 'preview'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {tab === 'editor' ? 'Редактор' : 'Просмотр'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-md mx-auto p-4 sm:p-5">
        {activeTab === 'editor' ? (
          <div className="space-y-4">
            {/* Клиент */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
                 <User size={14} /> Клиент
               </div>
               <input 
                 type="text" 
                 value={clientName} 
                 onChange={(e) => setClientName(e.target.value)} 
                 placeholder="Имя или название компании" 
                 className="w-full text-base font-medium text-slate-800 placeholder-slate-300 border-none focus:ring-0 p-0" 
               />
            </div>

            {/* Товары */}
            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-slate-400 text-xs uppercase font-bold tracking-wider flex items-center gap-2">
                  <Package size={14} /> Товары ({items.length})
                </span>
              </div>
              
              <div className="space-y-2">
                {items.map((item, index) => (
                  <ProductRow key={index} item={item} index={index} onUpdate={updateItem} onRemove={removeItem} />
                ))}
              </div>

              <button 
                onClick={() => setShowSearchModal(true)} 
                className="w-full mt-3 py-3 bg-white border border-dashed border-blue-300 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Search size={16} />
                Добавить товар
              </button>
            </div>

            {/* Итого */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mt-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Подытог</span>
                  <span>{subtotal.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Percent size={14}/> Общая скидка</span>
                  <div className="flex items-center bg-orange-50 rounded px-2">
                    <input 
                      type="number" 
                      value={globalDiscount} 
                      onChange={(e) => setGlobalDiscount(parseFloat(e.target.value)||0)} 
                      className="w-8 bg-transparent text-right py-0.5 text-orange-600 font-bold focus:ring-0 border-none p-0 text-sm" 
                    />
                    <span className="text-orange-400">%</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-slate-400 font-medium text-sm">Итого к оплате</span>
                <span className="text-xl font-bold text-slate-900">{total.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW */
          <div className="animate-in fade-in zoom-in-95 duration-300 pb-10">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-100 mb-6">
              <div className="bg-blue-600 px-6 py-6 text-white">
                 <div className="flex justify-between items-start mb-4">
                   <div className="opacity-80 text-xs font-bold uppercase tracking-wider">Коммерческое предложение</div>
                   <div className="text-blue-100 text-xs">{new Date().toLocaleDateString()}</div>
                 </div>
                 <h2 className="text-3xl font-bold">{total.toLocaleString()} ₽</h2>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between mb-6 pb-4 border-b border-slate-100">
                  <div><div className="text-[10px] text-slate-400 uppercase tracking-wide">Для кого</div><div className="font-semibold text-slate-800">{clientName || 'Клиент'}</div></div>
                  <div className="text-right"><div className="text-[10px] text-slate-400 uppercase tracking-wide">От кого</div><div className="font-semibold text-slate-800">{managerName.split(' ')[0]}</div></div>
                </div>

                <div className="space-y-4">
                  {items.map((item, i) => {
                    const itemPrice = item.price * (1 - (item.discount || 0) / 100);
                    return (
                      <div key={i} className="flex justify-between text-sm">
                        <div className="flex gap-3">
                           <span className="text-slate-300 font-mono text-xs pt-0.5">{i+1}</span>
                           <div>
                             <div className="font-medium text-slate-800 leading-snug">{item.name || 'Товар'}</div>
                             {item.sku && <div className="text-[10px] text-slate-400 mt-0.5">Арт: {item.sku}</div>}
                           </div>
                        </div>
                        <div className="text-right pl-4 whitespace-nowrap">
                           <div className="font-semibold text-slate-700">{itemPrice.toLocaleString()} ₽</div>
                           <div className="text-[10px] text-slate-400">{item.qty} шт</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {globalDiscount > 0 && (
                   <div className="mt-6 flex justify-between text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                      <span>Скидка на чек</span>
                      <span className="font-bold">-{globalDiscount}%</span>
                   </div>
                )}
              </div>
            </div>
            
            <button onClick={copyToClipboard} className={`w-full py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white active:scale-95'}`}>
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Скопировано!' : 'Скопировать текст'}
            </button>
          </div>
        )}
      </div>

      {/* SEARCH MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md sm:rounded-2xl rounded-t-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-10">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Добавить товар</h3>
                <button onClick={() => setShowSearchModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-500"><X size={20} /></button>
             </div>
             
             <div className="relative mb-3">
                <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input 
                  autoFocus 
                  type="text" 
                  placeholder="Введите артикул (напр. 32843000)" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                />
             </div>
             
             <button onClick={handleSearch} disabled={isSearching || !searchQuery} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mb-3 disabled:opacity-50">
               {isSearching ? 'Поиск...' : 'Найти'}
             </button>
             
             <button onClick={handleManualAdd} className="w-full py-3 text-slate-500 font-medium text-sm">
                Ввести вручную
             </button>
          </div>
        </div>
      )}

      {/* FAB */}
      {activeTab === 'editor' && (
        <div className="fixed bottom-6 left-0 right-0 px-5 max-w-md mx-auto z-10 pointer-events-none">
          <button onClick={() => setActiveTab('preview')} className="pointer-events-auto w-full bg-blue-600 text-white py-3.5 rounded-xl shadow-lg shadow-blue-500/30 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <FileText size={20} />
            К просмотру ({total.toLocaleString()} ₽)
          </button>
        </div>
      )}
    </div>
  );
}
