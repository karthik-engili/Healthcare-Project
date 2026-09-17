import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ProfileCompletionModal from '../../components/common/ProfileCompletionModal';
import api from '../../api/axios';
import { 
  FaRobot, 
  FaFileUpload, 
  FaCalendarCheck, 
  FaHistory, 
  FaHeartbeat, 
  FaClock, 
  FaAmbulance, 
  FaCheckCircle, 
  FaArrowRight, 
  FaNotesMedical, 
  FaVial, 
  FaPills, 
  FaShieldAlt, 
  FaBookMedical, 
  FaLightbulb,
  FaFemale,
  FaBaby,
  FaUserNurse,
  FaUserMd,
  FaPhoneAlt,
  FaPlay
} from 'react-icons/fa';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [dailyTips, setDailyTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [schedRes, docsRes, recsRes, tipsRes] = await Promise.allSettled([
          api.get('/api/reminders/schedules/today-schedule/'),
          api.get('/api/documents/'),
          api.get('/api/recommendations/my-recommendations/'),
          api.get('/api/recommendations/daily-tips/'),
        ]);

        if (schedRes.status === 'fulfilled') {
          setTodaySchedule(schedRes.value.data);
        }
        if (docsRes.status === 'fulfilled') {
          const docData = docsRes.value.data.results || docsRes.value.data;
          setRecentDocs(Array.isArray(docData) ? docData.slice(0, 4) : []);
        }
        if (recsRes.status === 'fulfilled') {
          setRecommendations(recsRes.value.data);
        }
        if (tipsRes.status === 'fulfilled') {
          setDailyTips(tipsRes.value.data.tips || []);
        }

        // Check post-login profile completion eligibility
        const isEligible = sessionStorage.getItem('profile_popup_eligible') === 'true';
        const isDismissed = sessionStorage.getItem('profile_popup_dismissed') === 'true';

        if (isEligible && !isDismissed) {
          try {
            const pRes = await api.get('/api/auth/profile/');
            if (pRes.data) {
              const p = pRes.data;
              const missing = [];
              if (!p.full_name || p.full_name === 'Patient') missing.push('Full Name');
              if (!p.date_of_birth) missing.push('Date of Birth');
              if (!p.gender) missing.push('Gender');
              if (!p.phone_number) missing.push('Phone Number');
              if (!p.village_town && !p.address) missing.push('Village / Residence Address');
              if (p.height_cm === null || p.height_cm === undefined || p.height_cm === '') missing.push('Height');
              if (p.weight_kg === null || p.weight_kg === undefined || p.weight_kg === '') missing.push('Weight');

              if (missing.length > 0) {
                setMissingFields(missing);
                setShowCompletionModal(true);
              } else {
                // Profile is complete!
                sessionStorage.removeItem('profile_popup_eligible');
              }
            }
          } catch (pErr) {
            console.warn('Profile completion check error:', pErr);
          }
        }
      } catch (err) {
        console.error('Error loading patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCloseModal = () => {
    setShowCompletionModal(false);
    sessionStorage.setItem('profile_popup_dismissed', 'true');
    sessionStorage.removeItem('profile_popup_eligible');
  };

  const handleUpdateProfile = () => {
    setShowCompletionModal(false);
    sessionStorage.setItem('profile_popup_dismissed', 'true');
    sessionStorage.removeItem('profile_popup_eligible');
    navigate('/patient/profile?mode=edit');
  };

  const getDisplayName = () => {
    if (user?.name && typeof user.name === 'string' && isNaN(Number(user.name)) && user.name.trim() !== '') {
      return user.name;
    }
    if (user?.full_name && typeof user.full_name === 'string' && isNaN(Number(user.full_name)) && user.full_name.trim() !== '') {
      return user.full_name;
    }
    if (user?.first_name || user?.last_name) {
      const full = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      if (full) return full;
    }
    if (user?.username && typeof user.username === 'string' && isNaN(Number(user.username)) && user.username.trim() !== '') {
      return user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
    return 'Patient';
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* 🌟 EXECUTIVE PATIENT GREETING & HEALTH STATUS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-teal-500/20 border border-teal-400/30 px-3 py-1 rounded-full text-teal-300 text-xs font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Patient Health Portal Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Namaste, {getDisplayName()}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Your personal medical intelligence hub: Review active prescriptions, follow-up schedules, and certified health guides.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/patient/upload-document">
              <Button variant="primary" size="md" icon={FaFileUpload} className="shadow-lg shadow-teal-500/20 text-xs sm:text-sm font-bold">
                Upload Rx / Lab
              </Button>
            </Link>
            <Link to="/patient/emergency">
              <Button variant="danger" size="md" icon={FaAmbulance} className="text-xs sm:text-sm font-bold">
                Emergency 108
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 📊 CLINICAL VITALS & ADHERENCE OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Medication Adherence */}
        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1E293B] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Medication Adherence</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center text-sm font-bold">
              <FaClock />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {todaySchedule?.adherence_pct ?? 100}%
          </h3>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
            {todaySchedule?.total_doses || 0} Doses Scheduled Today
          </p>
        </Card>

        {/* Card 2: Blood Pressure */}
        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1E293B] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Blood Pressure</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center text-sm font-bold">
              <FaHeartbeat />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">120 / 80</h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            Optimal Range (mmHg)
          </p>
        </Card>

        {/* Card 3: Fasting Blood Sugar */}
        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1E293B] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Fasting Sugar (FBS)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center text-sm font-bold">
              <FaVial />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">95 mg/dL</h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            Healthy Fasting Range
          </p>
        </Card>

        {/* Card 4: Active Medical Records */}
        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1E293B] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Prescriptions & Tests</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-bold">
              <FaNotesMedical />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {recentDocs.length > 0 ? recentDocs.length : '3'} Active
          </h3>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
            Archived in Vault
          </p>
        </Card>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: CLINICAL DIAGNOSTICS & DAILY MEDICATION TIMELINE
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Clinical Diagnostics & Medication Timeline
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Active Regimen</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left (7 Cols): Today's Active Medication Schedule */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-sm shadow-xs">
                    <FaPills />
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                    Today's Medication Doses
                  </h3>
                </div>
                <Link to="/patient/reminders" className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1">
                  <span>Manage Reminders</span> <FaArrowRight className="text-[10px]" />
                </Link>
              </div>

              {todaySchedule?.slots?.morning?.items?.length > 0 || todaySchedule?.slots?.night?.items?.length > 0 ? (
                <div className="space-y-3">
                  {['morning', 'afternoon', 'night'].map((slotKey) => {
                    const slot = todaySchedule?.slots?.[slotKey];
                    if (!slot || slot.items.length === 0) return null;

                    return (
                      <div key={slotKey} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          <span className="capitalize">{slot.label} ({slot.time})</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{slot.items.length} Medicines</span>
                        </div>
                        <div className="space-y-1.5">
                          {slot.items.map((item) => (
                            <div key={item.log_id} className="flex items-center justify-between text-xs p-2.5 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200/40 dark:border-slate-800">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.medicine_name}</span>
                                <span className="text-[10px] text-slate-400">{item.dosage}</span>
                              </div>
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                item.status === 'taken' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.status === 'taken' ? '✓ Taken' : '🕒 Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 space-y-2 text-slate-400 text-xs">
                  <FaPills className="text-3xl mx-auto opacity-30 text-teal-500" />
                  <p className="font-bold text-slate-600 dark:text-slate-300">No active medication reminders for today</p>
                  <Link to="/patient/upload-document" className="text-teal-600 font-bold hover:underline inline-block">
                    Upload prescription to auto-create alarms
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Right (5 Cols): Recent Uploaded Documents Archive */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm shadow-xs">
                    <FaHistory />
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                    Document Vault
                  </h3>
                </div>
                <Link to="/patient/document-history" className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1">
                  <span>View All</span> <FaArrowRight className="text-[10px]" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentDocs.length > 0 ? (
                  recentDocs.map((doc) => (
                    <div key={doc.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="space-y-0.5 max-w-[200px]">
                        <h5 className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{doc.document_name}</h5>
                        <p className="text-[10px] text-slate-400">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                      </div>
                      <Link
                        to="/patient/upload-document"
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-all"
                      >
                        View
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 space-y-2 text-slate-400 text-xs">
                    <FaNotesMedical className="text-3xl mx-auto opacity-30 text-teal-500" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">No records uploaded yet</p>
                    <Link to="/patient/upload-document" className="text-teal-600 font-bold hover:underline inline-block">
                      Upload your first prescription or lab report
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: AI CLINICAL GUIDANCE & PERSONALIZED RECOMMENDATIONS
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Personalized AI Guidance & Awareness
            </h2>
          </div>
          <Link to="/patient/recommendations" className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1">
            <span>View Full Guidance Suite</span> <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Box 1: Drug-Diet & Clinical Protocols */}
          <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-sm shadow-xs">
                  <FaLightbulb />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  Prescription-Tailored Guidance
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded">
                Active AI
              </span>
            </div>

            {recommendations?.insights?.length > 0 ? (
              <div className="space-y-3">
                {recommendations.insights.slice(0, 2).map((ins, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border-l-4 border-teal-500 space-y-1">
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase">{ins.badge}</span>
                    <h5 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">{ins.title}</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{ins.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">No active prescription alerts.</p>
            )}
          </Card>

          {/* Box 2: Seasonal Health Tips */}
          <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 shadow-md space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm shadow-xs">
                <FaHeartbeat />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                Daily Seasonal Awareness Tip
              </h3>
            </div>

            {dailyTips.length > 0 ? (
              <div className="p-4 bg-amber-50/60 dark:bg-slate-900/60 rounded-2xl border border-amber-200/80 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">
                  {dailyTips[0].author_badge}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {dailyTips[0].tip_text}
                </p>
                <div className="pt-2 flex justify-end">
                  <Link to="/patient/recommendations" className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline">
                    Read More Regional Tips →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">Loading daily awareness tips...</p>
            )}
          </Card>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: PUBLIC HEALTH EDUCATION & COMMUNITY LEARNING
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Health Education & Clinical Literacy Guides
            </h2>
          </div>
          <Link to="/patient/education" className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1">
            <span>Open Education Hub</span> <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link to="/patient/education">
            <Card hoverable className="p-4 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 space-y-2 h-full">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center text-base">
                <FaHeartbeat />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Preventive Care</h4>
              <p className="text-[10px] text-slate-400">Hypertension & Diabetes</p>
            </Card>
          </Link>

          <Link to="/patient/education">
            <Card hoverable className="p-4 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 space-y-2 h-full">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center text-base">
                <FaFemale />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Maternal Health</h4>
              <p className="text-[10px] text-slate-400">Prenatal & Iron Tablets</p>
            </Card>
          </Link>

          <Link to="/patient/education">
            <Card hoverable className="p-4 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 space-y-2 h-full">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center text-base">
                <FaBaby />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Child Healthcare</h4>
              <p className="text-[10px] text-slate-400">Immunization & ORS</p>
            </Card>
          </Link>

          <Link to="/patient/education">
            <Card hoverable className="p-4 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 space-y-2 h-full">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-base">
                <FaUserNurse />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Elderly Care</h4>
              <p className="text-[10px] text-slate-400">Fall Safety & Bone Health</p>
            </Card>
          </Link>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: TELE-CONSULTATIONS & 24/7 EMERGENCY ASSISTANCE
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">
            Critical Healthcare Network
          </span>
          <h3 className="text-xl sm:text-2xl font-black">Need a Doctor or 24/7 Ambulance SOS?</h3>
          <p className="text-xs text-rose-100 max-w-xl">
            Book verified tele-consultations or trigger 1-tap free emergency ambulance dispatch with GPS hospital telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/patient/appointments"
            className="px-5 py-2.5 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <FaUserMd /> <span>Book Doctor</span>
          </Link>
          <a
            href="tel:108"
            className="px-5 py-2.5 bg-rose-900 hover:bg-rose-950 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <FaPhoneAlt /> <span>Call 108</span>
          </a>
        </div>
      </div>

      <ProfileCompletionModal
        isOpen={showCompletionModal}
        missingFields={missingFields}
        onClose={handleCloseModal}
        onUpdate={handleUpdateProfile}
      />

    </div>
  );
};

export default PatientDashboard;
