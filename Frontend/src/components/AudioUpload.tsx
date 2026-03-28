import React, { useState, useRef } from 'react';
import { analyzeAudio } from '../services/api';
import ResultCard from './ResultCard';
import { FiUploadCloud, FiMic, FiSquare, FiLoader, FiPlay, FiTrash2 } from 'react-icons/fi';

const AudioUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/flac', 'audio/ogg', 'audio/mp4'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return 'Invalid file format. Allowed: WAV, MP3, FLAC, OGG, M4A';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
      } else {
        setError('');
        setFile(selectedFile);
        setRecordedAudio(null);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setFile(audioFile);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload or record audio');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await analyzeAudio(file);
      setResult(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze audio');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setRecordedAudio(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="section bg-white rounded-xl shadow-lg p-6 border-t-4 border-secondary-600">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        🎤 Audio Analysis
      </h2>

      {/* Recording and Upload Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white'
          }`}
        >
          {isRecording ? (
            <>
              <FiSquare className="mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <FiMic className="mr-2" />
              Start Recording
            </>
          )}
        </button>
      </div>

      {/* File Upload Area */}
      <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-600 transition-colors cursor-pointer">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="audio/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center w-full"
        >
          <FiUploadCloud className="text-4xl text-gray-400 mb-2" />
          <p className="font-semibold text-gray-700">Click to upload or drag audio file</p>
          <p className="text-sm text-gray-500 mt-1">WAV, MP3, FLAC, OGG, M4A (Max: 10MB)</p>
        </button>
      </div>

      {/* File Status */}
      {file && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900">
              {recordedAudio ? '🎙️ Recording' : '📁 File'}
            </p>
            <p className="text-blue-800 text-sm">{file.name || 'recording.wav'}</p>
            <p className="text-blue-700 text-xs mt-1">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
          <button
            onClick={clearFile}
            className="p-2 text-blue-600 hover:text-blue-800 transition"
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !file}
        className="w-full bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <FiLoader className="animate-spin mr-2" />
            Analyzing...
          </>
        ) : (
          <>
            <FiPlay className="mr-2" />
            Analyze Audio
          </>
        )}
      </button>

      {/* Result Display */}
      {result && <ResultCard result={result} title="Audio Analysis Result" />}
    </div>
  );
};

export default AudioUpload;
