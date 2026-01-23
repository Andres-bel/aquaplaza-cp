import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, FileText, Copy, Check, Calculator, 
  User, Briefcase, Search, ArrowRight, Package, X,
  Sparkles, Percent, Wifi, RefreshCw, Loader2,
  Save, FolderOpen, RotateCcw, Clock, Download, Share, 
  Image as ImageIcon, Send, Share2
} from 'lucide-react';

// --- НАСТРОЙКИ ---
const APP_VERSION = "6.3"; 
const API_URL = ''; 

// --- ВСТРОЕННЫЕ СТИЛИ (CSS) ---
const INTERNAL_STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding-bottom: 80px; -webkit-font-smoothing: antialiased; }
  .app-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); margin-bottom: 12px; border: 1px solid #f3f4f6; }
  .app-card-sm { padding: 12px; }
  
  .app-input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-size: 14px; outline: none; transition: border-color 0.2s; color: #000000 !important; -webkit-text-fill-color: #000000 !important; }
  .app-input:focus { border-color: #3b82f6; background: white; }
  .app-input::placeholder { color: #9ca3af; -webkit-text-fill-color: #9ca3af; }
  
  .app-input-ghost { background: transparent; border: none; padding: 0; margin: 0; width: 100%; outline: none; color: #000000 !important; }
  
  .app-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; active: scale(0.98); }
  .app-btn:active { transform: scale(0.98); }
  .app-btn-primary { background-color: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
  .app-btn-primary:hover { background-color: #1d4ed8; }
  .app-btn-secondary { background-color: white; color: #374151; border: 1px solid #e5e7eb; }
  .app-btn-secondary:hover { background-color: #f9fafb; border-color: #d1d5db; }
  .app-btn-dashed { background-color: white; color: #2563eb; border: 1px dashed #93c5fd; }
  .app-btn-dashed:hover { background-color: #eff6ff; }
  .app-btn-icon { padding: 8px; border-radius: 8px; color: #9ca3af; background: transparent; border: none; cursor: pointer; }
  .app-btn-icon:hover { color: #ef4444; background: #fef2f2; }
  .flex-between { display: flex; justify-content: space-between; align-items: center; }
  .text-sm { font-size: 14px; }
  .text-xs { font-size: 12px; }
  .text-bold { font-weight: 700; }
  .text-gray { color: #6b7280; }
  .text-blue { color: #2563eb; }
  .text-orange { color: #f97316; }
`;

// --- ЗАГРУЗЧИК СКРИПТОВ ---
const useExternalScripts = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = INTERNAL_STYLES;
    document.head.appendChild(styleTag);

    if (!document.getElementById('html2canvas-script')) {
      const script = document.createElement('script');
      script.id = 'html2canvas-script';
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);
  return loaded;
};

// --- КОМПОНЕНТЫ ---
const ProductRow = ({ item, onUpdate, onRemove, index }) => {
  const finalPrice = item.price * (1 - (item.discount || 0) / 100);
  const totalItemSum = finalPrice * item.qty;

  return (
    <div className="app-card app-card-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1, marginRight: '8px' }}>
           {item.sku && (
             <span className="text-xs text-blue text-bold" style={{ backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
               #{item.sku}
               {item.isAiGenerated && <Sparkles size={8} />}
             </span>
           )}
           <textarea
             rows={item.name.length > 30 ? 2 : 1}
             placeholder="Название товара..."
             value={item.name}
             onChange={(e) => onUpdate(index, 'name', e.target.value)}
             className="app-input-ghost text-sm text-bold"
             style={{ color: '#000000', resize: 'none', minHeight: '24px' }}
           />
        </div>
        <button onClick={() => onRemove(index)} className="app-btn-icon">
          <Trash2 size={18} />
        </button>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', padding: '8px', borderRadius: '8px' }}>
        <div style={{ flex: 1 }}>
          <span className="text-xs text-gray" style={{ display: 'block', marginBottom: '2px' }}>Цена</span>
          <input type="number" value={item.price === 0 ? '' : item.price} onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)} placeholder="0" className="app-input-ghost text-bold" />
        </div>
        
        <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>
        
        <div style={{ width: '50px', textAlign: 'center' }}>
          <span className="text-xs text-gray" style={{ display: 'block', marginBottom: '2px' }}>Скид%</span>
          <input type="number" placeholder="-" value={item.discount || ''} onChange={(e) => onUpdate(index, 'discount', parseFloat(e.target.value) || 0)} className="app-input-ghost text-bold text-orange" style={{ textAlign: 'center' }} />
        </div>
        
        <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>
        
        <div style={{ width: '40px', textAlign: 'center' }}>
          <span className="text-xs text-gray" style={{ display: 'block', marginBottom: '2px' }}>Шт</span>
          <input type="number" value={item.qty} onChange={(e) => onUpdate(index, 'qty', parseInt(e.target.value) || 1)} className="app-input-ghost text-bold" style={{ textAlign: 'center' }} />
        </div>
        
        <div style={{ minWidth: '70px', textAlign: 'right', paddingLeft: '8px', borderLeft: '1px solid transparent' }}>
           <span className="text-xs text-gray" style={{ display: 'block', marginBottom: '2px' }}>Сумма</span>
           <div className="text-sm text-bold text-blue">{totalItemSum.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const scriptsLoaded = useExternalScripts();

  const [activeTab, setActiveTab] = useState('editor');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Для модалки с картинкой
  const [showImageModal, setShowImageModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  
  // Данные
  const [clientName, setClientName] = useState('');
  const [managerName, setManagerName] = useState('Менеджер Aquaplaza');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [items, setItems] = useState([
    { sku: '32843000', name: 'Смеситель для кухни Grohe (Пример)', price: 12400, qty: 1, discount: 0, isAiGenerated: true }
  ]);
  const [copied, setCopied] = useState(false);
  const [savedCPs, setSavedCPs] = useState([]);
  const receiptRef = useRef(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      try { tg.expand(); } catch (e) {}
      if (tg.initDataUnsafe?.user?.first_name) {
        setManagerName(`${tg.initDataUnsafe.user.first_name} (Aquaplaza)`);
      }
    }
    const loadedHistory = localStorage.getItem('aquaplaza_history');
    if (loadedHistory) try { setSavedCPs(JSON.parse(loadedHistory)); } catch (e) {}

    const draft = localStorage.getItem('aquaplaza_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.items && d.items.length > 0) {
          setItems(d.items);
          setClientName(d.clientName || '');
          setGlobalDiscount(d.globalDiscount || 0);
          if (d.managerName) setManagerName(d.managerName);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const draft = { items, clientName, globalDiscount, managerName };
    localStorage.setItem('aquaplaza_draft', JSON.stringify(draft));
  }, [items, clientName, globalDiscount, managerName]);

  const generateCPText = () => {
    const date = new Date().toLocaleDateString('ru-RU');
    let text = `🌊 *Aquaplaza* | КП от ${date}\n`;
    if (clientName) text += `👤 Клиент: ${clientName}\n`;
    text += `\n`;
    items.forEach((item, i) => {
      const itemPrice = item.price * (1 - (item.discount || 0) / 100);
      text += `${i + 1}. ${item.name}\n`;
      if (item.sku) text += `   Арт: ${item.sku}\n`;
      if (item.discount > 0) text += `   Цена: ${item.price.toLocaleString()} - ${item.discount}% = ${itemPrice.toLocaleString()} ₽\n`;
      text += `   ${item.qty} шт × ${itemPrice.toLocaleString()} = ${(itemPrice * item.qty).toLocaleString()} ₽\n\n`;
    });
    text += `------------------\n`;
    if (globalDiscount > 0) text += `Доп. скидка на чек: ${globalDiscount}%\n`;
    const sub = items.reduce((s, i) => s + (i.price * (1 - (i.discount||0)/100) * i.qty), 0);
    const tot = sub * (1 - globalDiscount/100);
    text += `💎 *ИТОГО: ${tot.toLocaleString()} ₽*\n\n`;
    text += `📞 Ваш менеджер: ${managerName}`;
    return text;
  };

  // --- ЛОГИКА ШАРИНГА ---
  const handleShareFile = async () => {
    if (!receiptRef.current || !window.html2canvas) { alert("Подготовка..."); return; }
    
    setIsGeneratingImage(true);
    
    try {
      const canvas = await window.html2canvas(receiptRef.current, { 
        scale: 2, 
        backgroundColor: '#ffffff', 
        useCORS: true 
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Empty blob");
        const file = new File([blob], `kp_aquaplaza_${Date.now()}.png`, { type: 'image/png' });

        // 1. Сначала пробуем нативный шаринг ФАЙЛОМ (самый надежный для мобилок)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Коммерческое предложение',
              text: `КП для ${clientName || 'клиента'}`
            });
            setIsGeneratingImage(false);
            return;
          } catch (e) {
            console.log('Share cancelled');
          }
        } 
        
        // 2. Если не сработало (например, десктоп) - открываем модалку для ручного сохранения
        const dataUrl = canvas.toDataURL('image/png');
        setGeneratedImage(dataUrl);
        setShowImageModal(true);
        setIsGeneratingImage(false);

      }, 'image/png');
      
    } catch (error) {
      console.error(error);
      alert("Ошибка генерации");
      setIsGeneratingImage(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!clientName) { alert('Введите имя клиента.'); return; }
    const sub = items.reduce((s, i) => s + (i.price * (1 - (i.discount||0)/100) * i.qty), 0);
    const tot = sub * (1 - globalDiscount/100);
    const newCP = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      clientName, managerName, items, globalDiscount, total: tot
    };
    const newHistory = [newCP, ...savedCPs];
    setSavedCPs(newHistory);
    localStorage.setItem('aquaplaza_history', JSON.stringify(newHistory));
    if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    alert('✅ Сохранено');
  };

  const handleLoadCP = (cp) => {
    if (window.confirm(`Загрузить "${cp.clientName}"?`)) {
      setClientName(cp.clientName); setItems(cp.items); setGlobalDiscount(cp.globalDiscount);
      if (cp.managerName) setManagerName(cp.managerName);
      setShowHistoryModal(false);
    }
  };

  const handleDeleteCP = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Удалить?')) {
      const newHistory = savedCPs.filter(cp => cp.id !== id);
      setSavedCPs(newHistory);
      localStorage.setItem('aquaplaza_history', JSON.stringify(newHistory));
    }
  };

  const handleClear = () => {
    if (window.confirm('Очистить форму?')) {
      setClientName(''); setGlobalDiscount(0);
      setItems([{ sku: '', name: '', price: 0, qty: 1, discount: 0 }]);
    }
  };

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
          if (data && (data.found || data.name)) foundProduct = { ...data, qty: 1, discount: 0, isAiGenerated: false };
        } catch (err) {}
      }
      if (!foundProduct) {
        await new Promise(r => setTimeout(r, 600));
        foundProduct = { sku: cleanSku, name: `Товар арт. ${cleanSku} (Введите название)`, price: 0, qty: 1, discount: 0, isAiGenerated: true };
      }
      setItems([...items, foundProduct]);
      setShowSearchModal(false); setSearchQuery('');
    } catch (error) { alert("Ошибка поиска."); } 
    finally { setIsSearching(false); }
  };

  const handleManualAdd = () => { setItems([...items, { sku: '', name: '', price: 0, qty: 1, discount: 0 }]); setShowSearchModal(false); };
  const updateItem = (index, field, value) => { const newItems = [...items]; newItems[index][field] = value; setItems(newItems); };
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  
  const subtotal = items.reduce((sum, item) => { const itemPrice = item.price * (1 - (item.discount || 0) / 100); return sum + (itemPrice * item.qty); }, 0);
  const total = subtotal * (1 - globalDiscount / 100);

  const copyToClipboard = () => {
    const text = generateCPText();
    let success = false;
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; textArea.style.left = "-9999px"; textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea); textArea.focus(); textArea.select();
      success = document.execCommand('copy'); document.body.removeChild(textArea);
    } catch (err) { success = false; }
    if (success) { setCopied(true); setTimeout(() => setCopied(false), 2000); } 
    else if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); } 
    else { alert("Скопируйте вручную"); }
  };

  const handleReload = () => window.location.reload();

  if (!scriptsLoaded) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#2563eb'}}><Loader2 className="animate-spin" size={32}/></div>;

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div style={{ background:'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)', padding:'16px', paddingBottom:'12px', borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, zIndex:20 }}>
        <div className="flex-between" style={{ maxWidth:'480px', margin:'0 auto' }}>
          <div>
            <h1 className="text-bold" style={{ fontSize:'18px', display:'flex', alignItems:'center', gap:'8px' }}>
              КП Менеджер <button onClick={handleReload} style={{fontSize:'10px', background:'#f3f4f6', color:'#6b7280', padding:'2px 6px', borderRadius:'99px', border:'none', cursor:'pointer'}}>v{APP_VERSION}</button>
            </h1>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={() => setShowHistoryModal(true)} style={{ position:'relative', padding:'8px', background:'#f3f4f6', border:'none', borderRadius:'10px', cursor:'pointer' }}>
               <FolderOpen size={20} color="#4b5563" />
               {savedCPs.length > 0 && <span style={{position:'absolute', top:'-4px', right:'-4px', background:'#2563eb', color:'white', fontSize:'9px', width:'16px', height:'16px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', fontWeight:'bold'}}>{savedCPs.length}</span>}
            </button>
            <div style={{ background:'#f3f4f6', padding:'4px', borderRadius:'10px', display:'flex' }}>
              {['editor', 'preview'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'6px 12px', fontSize:'12px', fontWeight:'600', borderRadius:'8px', border:'none', cursor:'pointer', background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? '#2563eb' : '#6b7280', boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
                  {tab === 'editor' ? 'Ред.' : 'Вид'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'480px', margin:'0 auto', padding:'16px' }}>
        {activeTab === 'editor' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ display:'flex', gap:'8px' }}>
               <button onClick={handleSaveToHistory} className="app-btn app-btn-secondary" style={{ flex: 1 }}>
                  <Save size={16} className="text-blue" /> Сохранить
               </button>
               <button onClick={handleClear} className="app-btn app-btn-secondary" style={{ width:'auto' }}>
                  <RotateCcw size={16} />
               </button>
            </div>
            
            <div className="app-card">
               <div style={{ marginBottom:'12px' }}>
                 <div className="text-xs text-bold text-gray" style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px', textTransform:'uppercase' }}><User size={14} /> Клиент</div>
                 <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Имя или название компании" className="app-input" style={{ fontSize:'16px', fontWeight:'500' }} />
               </div>
               <div style={{ paddingTop:'12px', borderTop:'1px solid #f3f4f6' }}>
                 <div className="text-xs text-bold text-gray" style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px', textTransform:'uppercase' }}><Briefcase size={14} /> Менеджер</div>
                 <input type="text" value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="Имя менеджера" className="app-input" />
               </div>
            </div>

            <div>
              <div className="flex-between" style={{ padding:'0 4px', marginBottom:'8px' }}>
                <span className="text-xs text-bold text-gray" style={{ display:'flex', alignItems:'center', gap:'6px', textTransform:'uppercase' }}><Package size={14} /> Товары ({items.length})</span>
              </div>
              <div>{items.map((item, index) => (<ProductRow key={index} item={item} index={index} onUpdate={updateItem} onRemove={removeItem} />))}</div>
              <button onClick={() => setShowSearchModal(true)} className="app-btn app-btn-dashed" style={{ marginTop:'12px' }}><Search size={16} /> Добавить товар</button>
            </div>

            <div className="app-card">
              <div className="flex-between" style={{ marginBottom:'12px' }}>
                <span className="text-sm text-gray">Подытог</span><span className="text-bold">{subtotal.toLocaleString()} ₽</span>
              </div>
              <div className="flex-between">
                <span className="text-sm text-gray flex-between" style={{ gap:'4px' }}><Percent size={14}/> Общая скидка</span>
                <div style={{ display:'flex', alignItems:'center', background:'#fff7ed', padding:'0 8px', borderRadius:'8px' }}>
                  <input type="number" value={globalDiscount} onChange={(e) => setGlobalDiscount(parseFloat(e.target.value)||0)} className="app-input-ghost text-bold text-orange" style={{ width:'30px', textAlign:'right', padding:'4px 0' }} />
                  <span className="text-orange">%</span>
                </div>
              </div>
              <div className="flex-between" style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px solid #f3f4f6' }}>
                <span className="text-sm text-bold text-gray">Итого к оплате</span><span style={{ fontSize:'20px', fontWeight:'800', color:'#1f2937' }}>{total.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW */
          <div className="animate-in fade-in zoom-in-95 duration-300" style={{ paddingBottom:'80px' }}>
            <div ref={receiptRef} className="app-card" style={{ padding:'0', overflow:'hidden', border:'1px solid #e5e7eb' }}>
              <div style={{ background:'#2563eb', padding:'24px', color:'white' }}>
                 <div className="flex-between" style={{ marginBottom:'16px', alignItems:'flex-start' }}>
                   <div style={{ fontSize:'12px', fontWeight:'700', opacity:0.8, textTransform:'uppercase', letterSpacing:'1px' }}>Коммерческое предложение</div>
                   <div style={{ fontSize:'12px', color:'#bfdbfe' }}>{new Date().toLocaleDateString()}</div>
                 </div>
                 <h2 style={{ fontSize:'32px', fontWeight:'bold', margin:0 }}>{total.toLocaleString()} ₽</h2>
              </div>
              <div style={{ padding:'20px' }}>
                <div className="flex-between" style={{ marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid #f3f4f6' }}>
                  <div><div className="text-xs text-gray" style={{ textTransform:'uppercase', marginBottom:'4px' }}>Для кого</div><div className="text-bold">{clientName || 'Клиент'}</div></div>
                  <div style={{ textAlign:'right' }}><div className="text-xs text-gray" style={{ textTransform:'uppercase', marginBottom:'4px' }}>От кого</div><div className="text-bold">{managerName}</div></div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                  {items.map((item, i) => {
                    const itemPrice = item.price * (1 - (item.discount || 0) / 100);
                    return (
                      <div key={i} className="flex-between" style={{ alignItems:'flex-start', fontSize:'14px' }}>
                        <div style={{ display:'flex', gap:'12px', flex:1 }}>
                           <span className="text-xs text-gray" style={{ paddingTop:'2px', width:'16px' }}>{i+1}</span>
                           <div>
                             <div className="text-bold" style={{ lineHeight:'1.4', marginBottom:'2px' }}>{item.name || 'Товар'}</div>
                             {item.sku && <div className="text-xs text-gray">Арт: {item.sku}</div>}
                           </div>
                        </div>
                        <div style={{ textAlign:'right', paddingLeft:'16px' }}>
                           <div className="text-bold" style={{ color:'#374151' }}>{itemPrice.toLocaleString()} ₽</div>
                           <div className="text-xs text-gray">{item.qty} шт</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {globalDiscount > 0 && (
                   <div className="flex-between" style={{ marginTop:'24px', background:'#fff7ed', padding:'10px 16px', borderRadius:'8px', color:'#c2410c', fontSize:'14px' }}>
                      <span>Скидка на чек</span>
                      <span className="text-bold">-{globalDiscount}%</span>
                   </div>
                )}
                <div style={{ marginTop:'32px', paddingTop:'16px', borderTop:'1px solid #f9fafb', textAlign:'center' }}>
                   <p className="text-xs text-gray">Цены действительны 3 дня.</p>
                </div>
              </div>
            </div>
            
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {/* ГЛАВНАЯ КНОПКА - Share File */}
              <button 
                onClick={handleShareFile} 
                className="app-btn app-btn-primary" 
                style={{ fontSize:'16px' }}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
                {isGeneratingImage ? 'Создаю фото...' : '📤 Отправить файлом'}
              </button>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <button onClick={copyToClipboard} className="app-btn app-btn-secondary">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Текст' : 'Текст'}
                </button>

                {/* Фолбэк кнопка для ПК */}
                <button onClick={() => { setIsGeneratingImage(true); handleShareFile(); }} className="app-btn app-btn-secondary">
                   <ImageIcon size={18} /> Показать
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSearchModal && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center', background:'rgba(0,0,0,0.3)', backdropFilter:'blur(2px)' }}>
          <div className="animate-in slide-in-from-bottom-10" style={{ background:'white', width:'100%', maxWidth:'480px', borderRadius:'20px 20px 0 0', padding:'20px', boxShadow:'0 -4px 20px rgba(0,0,0,0.1)' }}>
             <div className="flex-between" style={{ marginBottom:'16px' }}>
                <h3 className="text-bold" style={{ fontSize:'18px' }}>Добавить товар</h3>
                <button onClick={() => setShowSearchModal(false)} className="app-btn-icon" style={{ background:'#f3f4f6' }}><X size={20} /></button>
             </div>
             <div style={{ position:'relative', marginBottom:'12px' }}>
                <Search size={18} style={{ position:'absolute', left:'12px', top:'14px', color:'#9ca3af' }} />
                <input autoFocus type="text" placeholder="Введите артикул" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="app-input" style={{ paddingLeft:'40px', fontSize:'16px', padding:'12px 12px 12px 40px' }} />
             </div>
             <button onClick={handleSearch} disabled={isSearching || !searchQuery} className="app-btn app-btn-primary" style={{ marginBottom:'12px', opacity: (isSearching || !searchQuery) ? 0.5 : 1 }}>{isSearching ? 'Поиск...' : 'Найти'}</button>
             <button onClick={handleManualAdd} className="app-btn" style={{ background:'transparent', color:'#6b7280' }}>Ввести вручную</button>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center', background:'rgba(0,0,0,0.3)', backdropFilter:'blur(2px)' }}>
          <div className="animate-in slide-in-from-bottom-10" style={{ background:'white', width:'100%', maxWidth:'480px', borderRadius:'20px 20px 0 0', height:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 -4px 20px rgba(0,0,0,0.1)' }}>
             <div className="flex-between" style={{ padding:'20px', borderBottom:'1px solid #f3f4f6' }}>
                <h3 className="text-bold" style={{ fontSize:'18px', display:'flex', alignItems:'center', gap:'8px' }}><FolderOpen size={20} className="text-blue"/> История ({savedCPs.length})</h3>
                <button onClick={() => setShowHistoryModal(false)} className="app-btn-icon" style={{ background:'#f3f4f6' }}><X size={20} /></button>
             </div>
             <div style={{ flex:1, overflowY:'auto', padding:'16px', background:'#f9fafb' }}>
               {savedCPs.length === 0 ? <div style={{ textAlign:'center', color:'#9ca3af', marginTop:'40px' }}><FolderOpen size={48} style={{ margin:'0 auto 12px', opacity:0.3 }}/><p>Пусто</p></div> : savedCPs.map((cp) => (
                   <div key={cp.id} onClick={() => handleLoadCP(cp)} className="app-card" style={{ cursor:'pointer', marginBottom:'12px', active:{ transform:'scale(0.98)' } }}>
                     <div className="flex-between" style={{ marginBottom:'8px', alignItems:'flex-start' }}><h4 className="text-bold" style={{ margin:0 }}>{cp.clientName}</h4><span className="text-xs text-bold text-blue" style={{ background:'#eff6ff', padding:'4px 8px', borderRadius:'99px' }}>{cp.total.toLocaleString()} ₽</span></div>
                     <div className="flex-between" style={{ alignItems:'flex-end' }}><div className="text-xs text-gray" style={{ display:'flex', alignItems:'center', gap:'4px' }}><Clock size={12}/> {cp.date} • {cp.items.length} поз.</div><button onClick={(e) => handleDeleteCP(e, cp.id)} className="app-btn-icon" style={{ padding:'6px' }}><Trash2 size={16} /></button></div>
                   </div>
                 ))}
             </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛЬНОЕ ОКНО С КАРТИНКОЙ --- */}
      {showImageModal && generatedImage && (
        <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)' }} onClick={() => setShowImageModal(false)}>
          <div style={{ width:'90%', maxWidth:'400px', background:'white', borderRadius:'16px', padding:'20px', textAlign:'center' }} onClick={e => e.stopPropagation()}>
             <h3 className="text-bold" style={{ marginBottom:'12px', fontSize:'18px' }}>Готово!</h3>
             <img src={generatedImage} alt="КП" style={{ width:'100%', borderRadius:'8px', border:'1px solid #e5e7eb', marginBottom:'16px' }} />
             
             <p className="text-sm text-bold text-blue" style={{ marginBottom:'8px' }}>
                👇 Как отправить?
             </p>
             <p className="text-xs text-gray" style={{ marginBottom:'16px', lineHeight:'1.5' }}>
                1. Зажмите картинку пальцем на 2 сек.<br/>
                2. Выберите "Поделиться" или "Копировать".
             </p>
             
             <button onClick={() => setShowImageModal(false)} className="app-btn app-btn-secondary">Закрыть</button>
          </div>
        </div>
      )}

      {activeTab === 'editor' && (
        <div style={{ position:'fixed', bottom:'20px', left:0, right:0, padding:'0 20px', zIndex:10, maxWidth:'480px', margin:'0 auto', pointerEvents:'none' }}>
          <button onClick={() => setActiveTab('preview')} className="app-btn app-btn-primary" style={{ boxShadow:'0 8px 20px rgba(37, 99, 235, 0.4)', pointerEvents:'auto' }}>
            <FileText size={20} />
            К просмотру ({total.toLocaleString()} ₽)
          </button>
        </div>
      )}
    </div>
  );
}
