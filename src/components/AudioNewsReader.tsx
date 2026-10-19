import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AudioNewsReaderProps {
  title?: string;
  summary?: string;
  content?: string;
}

export const AudioNewsReader: React.FC<AudioNewsReaderProps> = ({ title = '', summary = '', content = '' }) => {
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const prepareText = () => {
    // Strip markdown formatting symbols
    const cleanContent = (content || summary || '')
      .replace(/[#*_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .slice(0, 3000);
    return `${title || ''}। ${summary || ''}। ${cleanContent}`;
  };

  const startSpeaking = () => {
    if (!synthRef.current) return;

    synthRef.current.cancel();

    const text = prepareText();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Look for Hindi voice
    const voices = synthRef.current.getVoices();
    const hindiVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('IN'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = hindiVoice.lang;
    } else {
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    }

    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
  };

  const togglePlayPause = () => {
    if (!synthRef.current) return;

    if (!isPlaying) {
      startSpeaking();
    } else if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) return null;

  return (
    <div className="my-5 p-3.5 sm:p-4 rounded-2xl border border-red-200/80 dark:border-red-900/40 bg-gradient-to-r from-red-50/70 via-orange-50/40 to-white dark:from-[#1c1415] dark:via-[#17191d] dark:to-[#121417] flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="w-11 h-11 rounded-full bg-[#c41e24] hover:bg-red-700 text-white flex items-center justify-center transition shadow-md active:scale-95 focus:outline-none"
          title={isPlaying && !isPaused ? t('stopListening') : t('listenNews')}
          aria-label={t('listenNews')}
        >
          {isPlaying && !isPaused ? (
            <Pause className="w-5 h-5 fill-white" />
          ) : (
            <Play className="w-5 h-5 ml-0.5 fill-white" />
          )}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
              {isPlaying ? (isPaused ? 'ऑडियो रुका हुआ है' : 'ख़बर का वाचन जारी है...') : 'यह ख़बर सुनें (Listen Story)'}
            </span>

            {/* Soundwave Animation while playing */}
            {isPlaying && !isPaused && (
              <div className="flex items-end gap-1 h-5 ml-1">
                <span className="w-1 bg-red-600 dark:bg-red-500 rounded-full wave-bar-1"></span>
                <span className="w-1 bg-red-600 dark:bg-red-500 rounded-full wave-bar-2"></span>
                <span className="w-1 bg-red-600 dark:bg-red-500 rounded-full wave-bar-3"></span>
                <span className="w-1 bg-red-600 dark:bg-red-500 rounded-full wave-bar-4"></span>
                <span className="w-1 bg-red-600 dark:bg-red-500 rounded-full wave-bar-5"></span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            कबीरा एआई वॉइस रीडर • शुद्ध हिंदी उच्चारण
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Speed cycle button */}
        <button
          onClick={() => {
            const nextRate = speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 1.5 : 1.0;
            setSpeechRate(nextRate);
            if (isPlaying) {
              startSpeaking();
            }
          }}
          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          title="वाचन गति बदलें"
        >
          {speechRate}x
        </button>

        {isPlaying && (
          <button
            onClick={stopSpeaking}
            className="p-1.5 text-gray-500 hover:text-red-600 transition"
            title="बंद करें"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
