
import React, { useState, useEffect, useMemo } from 'react';
import { CulturalEntry, Category } from './types';
import { famousWorks } from './data/famousWorks';

const App: React.FC = () => {
  const [entries, setEntries] = useState<CulturalEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Película');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState(10);
  const [notes, setNotes] = useState('');
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<typeof famousWorks>([]);

  // Cargar datos y tema
  useEffect(() => {
    const savedData = localStorage.getItem('paulist_v2_data');
    if (savedData) {
      try { setEntries(JSON.parse(savedData)); } catch (e) { console.error(e); }
    }
    
    const savedTheme = localStorage.getItem('paulist_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Guardar datos
  useEffect(() => {
    localStorage.setItem('paulist_v2_data', JSON.stringify(entries));
  }, [entries]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('paulist_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('paulist_theme', 'light');
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (val.length > 1) {
      const filtered = famousWorks.filter(w => 
        w.title.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (work: typeof famousWorks[0]) => {
    setTitle(work.title);
    setCategory(work.category as Category);
    setSuggestions([]);
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Película');
    setDate(new Date().toISOString().split('T')[0]);
    setRating(10);
    setNotes('');
    setSeason('');
    setEpisode('');
    setEditingId(null);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const entryData = {
      title: title.trim(),
      category,
      date,
      rating,
      notes: notes.trim(),
      season: category === 'Serie' ? season : undefined,
      episode: category === 'Serie' ? episode : undefined,
    };

    if (editingId) {
      setEntries(prev => prev.map(entry => 
        entry.id === editingId ? { ...entry, ...entryData } : entry
      ));
    } else {
      const newEntry: CulturalEntry = {
        id: crypto.randomUUID(),
        ...entryData,
        createdAt: Date.now()
      };
      setEntries(prev => [newEntry, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (entry: CulturalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setCategory(entry.category);
    setDate(entry.date);
    setRating(entry.rating);
    setNotes(entry.notes);
    setSeason(entry.season || '');
    setEpisode(entry.episode || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta entrada?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, searchTerm]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
      <header className="mb-12 flex flex-col items-center relative">
        <button 
          onClick={toggleTheme}
          className="absolute right-0 top-0 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-belgrano transition-all active:scale-90"
        >
          {isDarkMode ? "☀️ Luz" : "🌙 Noche"}
        </button>

        <h1 className="text-7xl font-brand text-belgrano tracking-tighter leading-none">PAULIST</h1>
        <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-[0.4em] mt-2">Bitácora Personal</p>
      </header>

      {/* Formulario */}
      <section className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl mb-12 transition-colors">
        <h2 className="text-lg font-bold mb-6 text-belgrano uppercase flex items-center gap-2">
          {editingId ? '✏️ Editando Registro' : '➕ Nuevo Registro'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 relative">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Título / Artista</label>
              <input 
                required
                type="text" 
                value={title} 
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Busca: Volver al Futuro, Soda Stereo..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 focus:border-belgrano outline-none transition-all text-lg"
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-belgrano/30 rounded-xl overflow-hidden z-20 shadow-2xl animate-fade">
                  {suggestions.map((work, idx) => (
                    <button key={idx} type="button" onClick={() => selectSuggestion(work)} className="w-full px-5 py-3 text-left hover:bg-belgrano hover:text-zinc-950 flex justify-between items-center transition-colors">
                      <span className="font-bold">{work.title}</span>
                      <span className="text-[10px] opacity-70 italic uppercase">{work.year} • {work.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Categoría</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 outline-none font-bold"
              >
                <option value="Película">🎬 Película</option>
                <option value="Serie">📺 Serie</option>
                <option value="Recital">🎸 Recital</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Fecha</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 outline-none"
              />
            </div>

            {category === 'Serie' && (
              <div className="md:col-span-2 grid grid-cols-2 gap-4 animate-fade">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Temporada</label>
                  <input type="text" placeholder="1" value={season} onChange={e => setSeason(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Episodio</label>
                  <input type="text" placeholder="12" value={episode} onChange={e => setEpisode(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 outline-none" />
                </div>
              </div>
            )}

            <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black uppercase text-zinc-400">Puntuación</label>
                <span className="text-2xl font-brand text-belgrano">{rating}/10</span>
              </div>
              <input 
                type="range" min="0" max="10" step="0.5" value={rating} 
                onChange={e => setRating(parseFloat(e.target.value))}
                className="w-full accent-belgrano cursor-pointer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Notas / Crítica</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                placeholder="¿Qué te pareció?"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 h-28 resize-none outline-none focus:border-belgrano transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-belgrano text-white font-black py-5 rounded-2xl hover:bg-belgrano-dark transition-all shadow-xl active:scale-95 text-lg uppercase tracking-widest">
              {editingId ? 'GUARDAR CAMBIOS' : 'REGISTRAR'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-8 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl">✕</button>
            )}
          </div>
        </form>
      </section>

      {/* Listado */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-2">
          <h2 className="text-2xl font-brand text-zinc-400">REGISTROS ({entries.length})</h2>
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full py-3 px-6 text-sm focus:border-belgrano outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm hover:border-belgrano/40 transition-all group relative">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider ${
                    entry.category === 'Película' ? 'border-belgrano/30 text-belgrano' : 
                    entry.category === 'Serie' ? 'border-purple-500/30 text-purple-500' : 
                    'border-emerald-500/30 text-emerald-500'
                  }`}>
                    {entry.category}
                  </span>
                  <h3 className="text-2xl font-bold mt-2 leading-tight">{entry.title}</h3>
                </div>
                <div className={`text-2xl font-brand px-3 py-1 rounded-xl border border-zinc-100 dark:border-zinc-800 ${
                  entry.rating >= 8 ? 'text-yellow-400' : entry.rating >= 5 ? 'text-belgrano' : 'text-zinc-400'
                }`}>
                  {entry.rating}<span className="text-xs ml-0.5">/10</span>
                </div>
              </div>

              {entry.category === 'Serie' && (entry.season || entry.episode) && (
                <div className="text-[10px] font-black text-zinc-400 mb-3 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-950 inline-block px-2 py-0.5 rounded">
                  {entry.season && `T${entry.season}`} {entry.episode && ` • E${entry.episode}`}
                </div>
              )}

              <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">{entry.notes || <span className="italic opacity-30">Sin comentarios.</span>}</p>

              <div className="flex justify-between items-center pt-5 border-t border-zinc-50 dark:border-zinc-800/50">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{entry.date}</span>
                <div className="flex gap-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(entry)} className="text-[10px] font-black text-belgrano uppercase">Editar</button>
                  <button onClick={() => handleDelete(entry.id)} className="text-[10px] font-black text-red-500 uppercase">Borrar</button>
                </div>
              </div>
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem]">
              <p className="text-zinc-400 font-medium">No hay registros aún.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default App;
