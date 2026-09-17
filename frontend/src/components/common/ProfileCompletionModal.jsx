import React from 'react';
import { FaUserEdit, FaHeartbeat, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ProfileCompletionModal = ({ isOpen, missingFields = [], onClose, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fadeIn">
      <div 
        className="max-w-md w-full bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-700 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-5 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close icon button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/80 flex items-center justify-center text-xl shrink-0 shadow-xs">
            <FaHeartbeat />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Complete Your Health Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Please update your health profile so SevaHealth can provide more personalized health information.
            </p>
          </div>
        </div>

        {/* Missing fields checklist */}
        {missingFields.length > 0 && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <FaExclamationCircle className="text-amber-500" />
              <span>Pending Details:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missingFields.map((field, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            type="button"
            onClick={onUpdate}
            className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
          >
            <FaUserEdit />
            <span>Update Profile</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-xs transition-colors"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileCompletionModal;
