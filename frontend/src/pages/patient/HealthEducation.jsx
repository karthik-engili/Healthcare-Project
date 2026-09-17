import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import api from '../../api/axios';
import { 
  FaBookMedical, 
  FaHeartbeat, 
  FaFemale, 
  FaBaby, 
  FaUserNurse, 
  FaVolumeUp, 
  FaPlay, 
  FaStop, 
  FaSearch, 
  FaCheckCircle, 
  FaClock, 
  FaLanguage, 
  FaShareAlt,
  FaShieldAlt,
  FaVial,
  FaLightbulb
} from 'react-icons/fa';

const HealthEducation = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Preferred Language: 'en', 'te', 'hi', 'mr'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('preferred_language') || 'en';
  });

  // Audio Playback states
  const [playingId, setPlayingId] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/education/articles/', {
        params: {
          category: category !== 'all' ? category : undefined,
          search: search || undefined
        }
      });
      const data = res.data.results || res.data;
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load health education articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [category, search]);

  const handlePlayAudio = (article) => {
    if (audioObj) {
      audioObj.pause();
      setAudioObj(null);
      if (playingId === article.id) {
        setPlayingId(null);
        return;
      }
    }

    const baseUrl = import.meta.env.VITE_API_URL || '';
    const audioUrl = `${baseUrl}/api/education/articles/${article.id}/audio/?lang=${lang}`;
    const newAudio = new Audio(audioUrl);
    setPlayingId(article.id);
    setAudioObj(newAudio);

    newAudio.play().catch(err => {
      console.error('Audio playback error:', err);
      setPlayingId(null);
    });

    newAudio.onended = () => {
      setPlayingId(null);
      setAudioObj(null);
    };
  };

  const getIconComponent = (category) => {
    switch (category) {
      case 'preventive': return FaHeartbeat;
      case 'maternal': return FaFemale;
      case 'child_care': return FaBaby;
      case 'elderly_care': return FaUserNurse;
      default: return FaBookMedical;
    }
  };

  const getArticleTitle = (art) => {
    if (lang === 'te' && art.title_te) return art.title_te;
    if (lang === 'hi' && art.title_hi) return art.title_hi;
    if (lang === 'mr' && art.title_mr) return art.title_mr;
    return art.title;
  };

  const getArticleSummary = (art) => {
    if (lang === 'te' && art.summary_te) return art.summary_te;
    if (lang === 'hi' && art.summary_hi) return art.summary_hi;
    if (lang === 'mr' && art.summary_mr) return art.summary_mr;
    return art.summary;
  };

  const getArticleContent = (art) => {
    if (lang === 'te' && art.content_te) return art.content_te;
    if (lang === 'hi' && art.content_hi) return art.content_hi;
    if (lang === 'mr' && art.content_mr) return art.content_mr;
    return art.content;
  };

  const getArticleTakeaways = (art) => {
    if (lang === 'te' && art.key_takeaways_te?.length > 0) return art.key_takeaways_te;
    if (lang === 'hi' && art.key_takeaways_hi?.length > 0) return art.key_takeaways_hi;
    if (lang === 'mr' && art.key_takeaways_mr?.length > 0) return art.key_takeaways_mr;
    return art.key_takeaways || [];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* 🌟 Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-teal-500/20 border border-teal-400/30 px-3 py-1 rounded-full text-teal-300 text-xs font-bold uppercase tracking-wider">
              <FaBookMedical className="text-teal-400" />
              <span>Public Health Education & Clinical Literacy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Health Guidance & Medical Knowledge Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Certified clinical guides for disease prevention, maternal care, child immunization, and senior health with regional voice narration.
            </p>
          </div>

          {/* Language Switcher */}
          <div className="bg-slate-800/80 border border-slate-700 p-2 rounded-2xl flex items-center space-x-1.5 shrink-0">
            <FaLanguage className="text-teal-400 text-base ml-1" />
            {[
              { code: 'te', label: 'తెలుగు' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'mr', label: 'मराठी' },
              { code: 'en', label: 'English' }
            ].map(l => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  localStorage.setItem('preferred_language', l.code);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  lang === l.code
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🧭 Category Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: 'all', label: 'All Health Guides', icon: FaBookMedical },
            { id: 'preventive', label: 'Preventive Care', icon: FaHeartbeat },
            { id: 'maternal', label: 'Maternal Health', icon: FaFemale },
            { id: 'child_care', label: 'Child Healthcare', icon: FaBaby },
            { id: 'elderly_care', label: 'Elderly Care', icon: FaUserNurse },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  category === tab.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="text-sm shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search health guide..."
            icon={FaSearch}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 📚 Articles Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading verified medical guides...</div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art) => {
            const Icon = getIconComponent(art.category);
            const isPlaying = playingId === art.id;

            return (
              <Card key={art.id} hoverable className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 shadow-md space-y-4 flex flex-col justify-between">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-lg flex items-center space-x-1.5">
                      <Icon className="text-xs" />
                      <span>{art.category_display}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-semibold">
                      <FaClock className="text-[10px]" />
                      <span>{art.read_time_minutes} min read</span>
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-snug">
                    {getArticleTitle(art)}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">
                    {getArticleSummary(art)}
                  </p>

                  {/* Key Takeaways Preview */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/40 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-400 flex items-center space-x-1">
                      <FaLightbulb /> <span>Key Takeaways:</span>
                    </span>
                    <ul className="space-y-1">
                      {getArticleTakeaways(art).slice(0, 2).map((pt, idx) => (
                        <li key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start space-x-1.5 font-medium">
                          <FaCheckCircle className="text-teal-500 text-[10px] mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Actions: Voice Narration & Read Full Guide */}
                <div className="flex items-center space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(art)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      isPlaying
                        ? 'bg-rose-600 text-white animate-pulse shadow-md'
                        : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 hover:bg-teal-100 border border-teal-200/60 dark:border-teal-800'
                    }`}
                  >
                    {isPlaying ? <FaStop /> : <FaVolumeUp />}
                    <span>{isPlaying ? 'Stop Audio' : `Listen Audio (${lang.toUpperCase()})`}</span>
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedArticle(art)}
                    className="px-4 py-2 font-bold text-xs"
                  >
                    Read Guide
                  </Button>
                </div>

              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 text-slate-400">
          <FaBookMedical className="text-5xl mx-auto opacity-30 text-teal-500" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No articles found in this category</h3>
          <p className="text-xs">Try selecting 'All Health Guides' or searching for different symptoms.</p>
        </div>
      )}

      {/* 📖 Full Article Modal View */}
      {selectedArticle && (
        <Modal
          isOpen={Boolean(selectedArticle)}
          onClose={() => setSelectedArticle(null)}
          title={getArticleTitle(selectedArticle)}
        >
          <div className="space-y-5 pt-2">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase">
                {selectedArticle.category_display}
              </span>
              <button
                type="button"
                onClick={() => handlePlayAudio(selectedArticle)}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs"
              >
                <FaVolumeUp />
                <span>{playingId === selectedArticle.id ? 'Stop Voice' : `Listen in ${lang.toUpperCase()}`}</span>
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400">Clinical Overview:</h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {getArticleContent(selectedArticle)}
              </p>
            </div>

            {/* Key Clinical Recommendations List */}
            <div className="p-4 bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-200/80 dark:border-teal-900 space-y-2.5">
              <h4 className="text-xs font-black uppercase text-teal-900 dark:text-teal-300 flex items-center space-x-1.5">
                <FaShieldAlt className="text-teal-600" />
                <span>Actionable Medical Directives:</span>
              </h4>
              <ul className="space-y-2">
                {getArticleTakeaways(selectedArticle).map((pt, idx) => (
                  <li key={idx} className="text-xs text-slate-800 dark:text-slate-200 flex items-start space-x-2 font-semibold">
                    <FaCheckCircle className="text-teal-600 text-xs mt-0.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="md" onClick={() => setSelectedArticle(null)}>
                Close Guide
              </Button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};

export default HealthEducation;
