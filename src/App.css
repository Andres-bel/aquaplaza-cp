import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, FileText, Copy, Check, Calculator, 
  User, Briefcase, Search, ArrowRight, Package, X,
  Sparkles, Percent, Wifi, RefreshCw
} from 'lucide-react';

// --- НАСТРОЙКИ ---
const APP_VERSION = "4.1"; // Измените это число, чтобы проверить обновление
const API_URL = ''; 

// --- КОМПОНЕНТЫ ---

const LoadingSpinner = () => (
  <div className="flex items-center gap-2 text-blue-600 font-medium animate-pulse">
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
    <span>Поиск на сайте...</span>
  </div>
);

const ProductRow = ({ item, onUpdate, onRemove, index }) => {
  const finalPrice = item.price * (1 - (item.discount || 0) / 100);
  const totalItemSum = finalPrice * item.qty;

  return (
    <div className="group bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 mb-3 transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1">
           {item.sku && (
             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide mb-1 inline-flex items-center gap-1 ${item.isAiGenerated ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
               #{item.sku}
               {item.isAiGenerated ? <Sparkles size={8} /> : <Wifi size={8} />}
             </span>
           )}
           <textarea
             rows={2}
             placeholder="Название товара..."
             value={item.name}
             onChange={(e) => onUpdate(index, 'name', e.target.value)}
             className="w-full text-sm font-medium text-gray-800 placeholder-gray-300 bg-transparent border-none focus:ring-0 p-0 resize-none leading-tight"
           />
        </div>
        <button 
          onClick={() => onRemove(index)}
          className="text-gray-300 hover:text-red-500 p-1 -mr-1 transition-colors opacity-0 group-hover:opacity-100 mobile-visible"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-xl">
        <div className="flex-1 relative min-w-[60px]">
          <label className="text-[9px] text-gray-400 absolute -top-1.5 left-1 bg-white px-1">Цена</label>
          <input
            type="number"
            value={item.price === 0 ? '' : item.price}
            onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full bg-transparent text-sm font-semibold text-gray-700 border-none focus:ring-0 p-0 pl-1"
          />
        </div>
        <div className="w-px h-5 bg-gray-200"></div>
        <div className="w-12 relative text-center">
          <label className="text-[9px] text-gray-400 absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-1">Скидка%</label>
          <input
            type="number"
            placeholder="0"
            value={item.discount || ''}
            onChange={(e) => onUpdate(index, 'discount', parseFloat(e.target.value) || 0)}
            className="w-full bg-transparent text-center text-sm font-semibold text-orange-500 border-none focus:ring-0 p-0"
          />
        </div>
        <div className="w-px h-5 bg-gray-200"></div>
        <div className="w-12 relative text-center">
          <label className="text-[9px] text-gray-400 absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-1">Шт</label>
          <input
            type="number"
            value={item.qty}
            onChange={(e) => onUpdate(index, 'qty', parseInt(e.target.value) || 1)}
            className="w-full bg-transparent text-center text-sm font-semibold text-gray-700 border-none focus:ring-0 p-0"
          />
        </div>
        <div className="min-w-[70px] text-right pr-1 ml-auto">
           <div className="text-[9px] text-gray-400 mb-0.5">Сумма</div>
           <div className="text-sm font-bold text-blue-600">{totalItemSum.toLocaleString()} ₽</div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
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

  // --- УМНЫЙ ПОИСК (API + Fallback to AI) ---
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
        } catch (err) {
          console.log("API Error");
        }
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

  // Функция принудительного обновления (можно вызвать нажатием на версию)
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-gray-800 font-sans pb-24">
      {/* HEADER */}
      <div className="bg-white px-5 pt-12 pb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sticky top-0 z-20">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              КП Менеджер 
              <button onClick={handleReload} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-green-200">
                 v{APP_VERSION} <RefreshCw size={8}/>
              </button>
            </h1>
            <p className="text-xs text-gray-400 font-medium">Aquaplaza Online</p>
          </div>
          <div className="flex bg-gray-100/80 p-1 rounded-xl">
            {['editor', 'preview'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-xs font-semibold rounded-[9px] transition-all duration-300 ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab === 'editor' ? 'Ред.' : 'Вид'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-md mx-auto p-5">
        {activeTab === 'editor' ? (
          <div className="space-y-6">
            <section className="bg-white p-4 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
               <div className="flex gap-3 items-center mb-4">
                 <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><User size={16} strokeWidth={2.5} /></div>
                 <span className="font-bold text-gray-700 text-sm">Данные клиента</span>
               </div>
               <div className="space-y-3">
                 <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Имя клиента..." className="w-full bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 text-sm font-medium transition-all" />
               </div>
            </section>

            <section>
              <div className="flex justify-between items-end mb-4 px-1">
                <span className="font-bold text-gray-700 text-sm flex items-center gap-2"><Package size={16} className="text-gray-400" />Товары ({items.length})</span>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <ProductRow key={index} item={item} index={index} onUpdate={updateItem} onRemove={removeItem} />
                ))}
              </div>
              <button onClick={() => setShowSearchModal(true)} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95">
                <Search size={18} />
                Найти товар
              </button>
            </section>

            <section className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-50 mt-8">
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-gray-500"><span>Сумма товаров</span><span>{subtotal.toLocaleString()} ₽</span></div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Percent size={14}/> Общая скидка</span>
                  <div className="flex items-center bg-orange-50 rounded-lg px-2 border border-orange-100">
                    <input type="number" value={globalDiscount} onChange={(e) => setGlobalDiscount(parseFloat(e.target.value)||0)} className="w-12 bg-transparent text-right py-1 text-orange-600 font-bold focus:ring-0 border-none p-0" />
                    <span className="ml-1 text-orange-400">%</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-baseline"><span className="text-gray-400 font-medium">К оплате</span><span className="text-2xl font-black text-gray-900 tracking-tight">{total.toLocaleString()} ₽</span></div>
              </div>
            </section>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300 pb-10">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 mb-6 relative border border-gray-100">
              <div className="bg-[#007AFF] px-6 py-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3"><Calculator size={200} /></div>
                <div className="relative z-10">
                   <div className="opacity-80 text-xs font-medium uppercase tracking-widest mb-2">Коммерческое предложение</div>
                   <h2 className="text-3xl font-bold mb-1">{total.toLocaleString()} ₽</h2>
                   <div className="text-blue-100 text-sm">{items.length} товаров • {new Date().toLocaleDateString()}</div>
                </div>
              </div>
              <div className="p-6 relative">
                <div className="absolute top-0 left-0 right-0 h-4 -mt-2 bg-[url('https://raw.githubusercontent.com/adrianmcli/css-scalloped-shapes/master/dist/scallop.svg')] bg-contain bg-repeat-x opacity-10"></div>
                <div className="flex justify-between mb-8 pb-4 border-b border-gray-100">
                  <div><div className="text-[10px] text-gray-400 uppercase tracking-wide">Клиент</div><div className="font-semibold text-gray-800">{clientName || 'Частное лицо'}</div></div>
                  <div className="text-right"><div className="text-[10px] text-gray-400 uppercase tracking-wide">Менеджер</div><div className="font-semibold text-gray-800">{managerName.split(' ')[0]}</div></div>
                </div>
                <div className="space-y-4 mb-8">
                  {items.map((item, i) => {
                    const itemPrice = item.price * (1 - (item.discount || 0) / 100);
                    return (
                      <div key={i} className="flex justify-between items-start text-sm group">
                        <div className="flex gap-3">
                           <span className="text-gray-300 font-mono text-xs pt-0.5">{i+1}</span>
                           <div>
                             <div className="font-medium text-gray-800 leading-snug mb-0.5">{item.name || 'Товар'}</div>
                             <div className="flex gap-2 text-[10px]">
                               {item.sku && <span className="text-gray-400">Арт: {item.sku}</span>}
                               {item.discount > 0 && <span className="text-orange-500 font-bold">-{item.discount}%</span>}
                             </div>
                           </div>
                        </div>
                        <div className="text-right pl-4 whitespace-nowrap">
                           <div className="font-semibold text-gray-700">{(itemPrice * item.qty).toLocaleString()}</div>
                           <div className="text-[10px] text-gray-400">{item.qty} x {itemPrice.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {globalDiscount > 0 && <div className="flex justify-between text-sm text-orange-600 mb-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-100"><span className="font-medium">Доп. скидка</span><span className="font-bold">-{globalDiscount}%</span></div>}
              </div>
              <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100"><p className="text-[10px] text-gray-400 leading-relaxed max-w-[200px] mx-auto">Цены действительны 3 дня. Спасибо, что выбрали Aquaplaza!</p></div>
            </div>
            <button onClick={copyToClipboard} className={`w-full py-4 rounded-2xl font-bold text-base shadow-xl shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 ${copied ? 'bg-green-500 text-white' : 'bg-[#007AFF] text-white hover:bg-blue-600'}`}>{copied ? <Check size={20} /> : <Copy size={20} />}{copied ? 'Скопировано!' : 'Скопировать для чата'}</button>
          </div>
        )}
      </div>

      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Search size={18} className="text-blue-500" />Поиск товара</h3>
                <button onClick={() => setShowSearchModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500"><X size={20} /></button>
             </div>
             <div className="bg-gray-50 p-1 rounded-xl flex gap-1 mb-6 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <div className="flex-1 relative">
                   <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search size={18} className="text-gray-400" /></div>
                   <input autoFocus type="text" placeholder="Введите артикул" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-full pl-10 pr-4 py-3 bg-transparent border-none text-sm font-medium focus:ring-0 outline-none" />
                </div>
                <button onClick={handleSearch} disabled={isSearching || !searchQuery} className="bg-blue-600 text-white px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed m-1 transition-colors">
                  {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/> : <ArrowRight size={20} />}
                </button>
             </div>
             <button onClick={handleManualAdd} className="w-full py-3.5 bg-gray-50 text-gray-500 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm">Ввести вручную</button>
          </div>
        </div>
      )}

      {activeTab === 'editor' && (
        <div className="fixed bottom-6 left-0 right-0 px-5 max-w-md mx-auto pointer-events-none z-10">
          <button onClick={() => setActiveTab('preview')} className="w-full bg-[#007AFF] text-white py-4 rounded-2xl shadow-xl shadow-blue-500/30 font-bold flex items-center justify-center gap-2 pointer-events-auto active:scale-[0.98] transition-transform backdrop-blur-md border border-white/20"><FileText size={20} />Сформировать ({total.toLocaleString()} ₽)</button>
        </div>
      )}
    </div>
  );
}
