// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info, Camera, FolderOpen, RotateCw, Volume2, VolumeX, X, Maximize2 } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { usePoseDetection, usePoseDetectionLoop } from '../hooks/usePoseDetection';
import { useCamera } from '../hooks/useCamera';
import { useExerciseCounter } from '../hooks/useExerciseCounter';
import { drawKeypoints, drawSkeleton, drawText } from '../utils/poseUtils';
import { getAvailableExercises, getExerciseConfig } from '../detectors/exerciseDetectors';
import { speak } from '../utils/speechUtils';

function ScanExo() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [exerciseType, setExerciseType] = useState('squat');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isLandscapeVideo, setIsLandscapeVideo] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);

    const { detector, isLoading: isLoadingDetector, error: detectorError } = usePoseDetection();
    const camera = useCamera(videoRef, fileInputRef);
    const counter = useExerciseCounter(exerciseType);

    const toggleFullScreen = async () => {
        if (!isFullScreen) {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    await document.documentElement.webkitRequestFullscreen();
                }

                if (screen.orientation && screen.orientation.lock) {
                    const orientation = isLandscapeVideo ? 'landscape' : 'portrait';
                    screen.orientation.lock(orientation).catch(() => {});
                }

                setIsFullScreen(true);
            } catch (err) {
                console.error("Erreur activation plein écran:", err);
            }
        } else {
            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                }
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                }
                setIsFullScreen(false);
            } catch (err) {
                console.error("Erreur sortie plein écran:", err);
                setIsFullScreen(false);
            }
        }
    };

    const fullScreenContainerStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const fullScreenCanvasStyle = {
        maxHeight: '100vh',
        maxWidth: '100vw',
        objectFit: 'contain'
    };

    const handlePoseDetected = (pose, ctx) => {
        if (camera.videoSource === 'file' && videoRef.current && videoRef.current.paused && videoRef.current.currentTime === 0) {
            videoRef.current.play().catch(e => console.error("Erreur lecture auto:", e));
        }

        drawKeypoints(pose.keypoints, ctx);
        drawSkeleton(pose.keypoints, ctx);

        const detection = counter.processKeypoints(pose.keypoints);

        if (detection) {
            drawText(ctx, `Angle: ${Math.round(detection.angle)}°`, 10, 30, {
                font: '20px Arial',
                color: '#FFFFFF',
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
            });

            if (detection.position) {
                drawText(
                    ctx,
                    `Position: ${detection.position === 'down' ? 'Bas' : 'Haut'}`,
                    10,
                    60,
                    {
                        font: '18px Arial',
                        color: detection.position === 'down' ? '#FF6B35' : '#22C55E',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }
                );
            }

            if (detection.feedback) {
                const translatedFeedback = t(detection.feedback);
                const isWarning = detection.feedback.includes('Attention') || translatedFeedback.includes('Warning') || translatedFeedback.includes('Attention');

                if (voiceEnabled) {
                    speak(translatedFeedback, { rate: 1.1, cooldown: 3000, cancel: true });
                }

                drawText(
                    ctx,
                    translatedFeedback,
                    10,
                    90,
                    {
                        font: 'bold 24px Arial',
                        color: '#FFFFFF',
                        backgroundColor: isWarning ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.8)'
                    }
                );
            }
        }
    };

    usePoseDetectionLoop({
        detector,
        videoRef,
        canvasRef,
        onPoseDetected: handlePoseDetected,
        isActive: camera.isActive
    });

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !camera.isActive) return;

        const checkOrientation = () => {
            if (video.videoWidth && video.videoHeight) {
                const isLandscape = video.videoWidth > video.videoHeight;
                setIsLandscapeVideo(isLandscape);
            } else {
                setIsLandscapeVideo(false);
            }
        };

        checkOrientation();
        video.addEventListener('loadedmetadata', checkOrientation);
        video.addEventListener('resize', checkOrientation);

        return () => {
            video.removeEventListener('loadedmetadata', checkOrientation);
            video.removeEventListener('resize', checkOrientation);
        };
    }, [camera.isActive, camera.videoSource]);

    const handleExerciseChange = (e) => {
        const newExercise = e.target.value;
        setExerciseType(newExercise);
        counter.changeExercise(newExercise);
    };

    const currentExerciseConfig = getExerciseConfig(exerciseType);
    const availableExercises = getAvailableExercises();

    useEffect(() => {
        if (camera.isActive) counter.reset();
    }, [camera.isActive, counter.reset]);

    useEffect(() => {
        return () => camera.stop();
    }, []);

    const handleFullReset = () => {
        camera.stop();
        counter.reset();
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleReplay = () => {
        camera.replay();
        counter.reset();
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <Header />

            <main className="flex-1 flex flex-col items-center p-4 md:p-8 pb-24">
                <div className="w-full max-w-4xl mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sport hover:text-sport-secondary font-bold transition-colors"
                    >
                       {t('common.back')}
                    </button>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
                    {t('scan.title')}
                </h1>

                <div className="mb-4 md:mb-6 space-y-2 text-center min-h-[24px]">
                    {isLoadingDetector && (
                        <span className="inline-block px-3 py-1 bg-sport/10 text-sport rounded-full text-sm font-medium animate-pulse">
                            {t('scan.loadingModel')}
                        </span>
                    )}
                    {detectorError && (
                        <span className="inline-block px-3 py-1 bg-error/10 text-error rounded-full text-sm font-medium">
                            {t('scan.error', { message: detectorError })}
                        </span>
                    )}
                    {camera.error && (
                        <span className="inline-block px-3 py-1 bg-error/10 text-error rounded-full text-sm font-medium">
                            {camera.error}
                        </span>
                    )}
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl shadow-md w-full max-w-4xl mb-4 md:mb-6 border border-gray-100">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Type d'exercice
                        </label>
                        <select
                            value={exerciseType}
                            onChange={handleExerciseChange}
                            disabled={camera.isActive}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:ring-2 focus:ring-sport focus:border-sport outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {availableExercises.map(exercise => (
                                <option key={exercise.id} value={exercise.id}>
                                    {t(exercise.name)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <button
                            onClick={camera.startCamera}
                            disabled={camera.isActive || isLoadingDetector}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-white text-sm md:text-base transition-all active:scale-95 shadow-sm ${
                                camera.isActive ? 'bg-gray-300 cursor-not-allowed' : 'bg-sport hover:bg-sport-secondary'
                            }`}
                        >
                            <Camera className="w-5 h-5" />
                            <span>Caméra</span>
                        </button>

                        <button
                            onClick={camera.openFileSelector}
                            disabled={camera.isActive || isLoadingDetector}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-white text-sm md:text-base transition-all active:scale-95 shadow-sm ${
                                camera.isActive ? 'bg-gray-300 cursor-not-allowed' : 'bg-nutrition hover:bg-nutrition-secondary'
                            }`}
                        >
                            <FolderOpen className="w-5 h-5" />
                            <span>Fichier</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {camera.isEnded ? (
                            <button
                                onClick={handleReplay}
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-accent hover:brightness-110 text-white rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95"
                            >
                                <RotateCw className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('scan.btnReplay') || 'Replay'}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    camera.stop();
                                    if (canvasRef.current) {
                                        const ctx = canvasRef.current.getContext('2d');
                                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                                    }
                                }}
                                disabled={!camera.isActive}
                                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm text-white shadow-sm transition-all active:scale-95 ${
                                    !camera.isActive ? 'bg-gray-300 cursor-not-allowed' : 'bg-error hover:brightness-110'
                                }`}
                            >
                                <span>⏹</span>
                                <span className="hidden sm:inline">{t('scan.btnStop') || 'Stop'}</span>
                            </button>
                        )}

                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm text-white shadow-sm transition-all active:scale-95 ${
                                voiceEnabled ? 'bg-sport hover:brightness-110' : 'bg-gray-500 hover:bg-gray-600'
                            }`}
                            title={voiceEnabled ? t('scan.voiceOff') : t('scan.voiceOn')}
                        >
                            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            <span className="hidden sm:inline">{voiceEnabled ? 'On' : 'Off'}</span>
                        </button>

                        <button
                            onClick={handleFullReset}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-sport-secondary hover:bg-sport text-white rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95"
                            title={t('scan.btnReset')}
                        >
                            <span>↻</span>
                            <span className="hidden sm:inline">{t('scan.btnReset') || 'Reset'}</span>
                        </button>
                    </div>
                </div>

                {/* Compteur de répétitions */}
                <div className="mb-4 md:mb-6 text-center">
                    <div className="inline-block bg-sport/10 px-6 py-3 rounded-2xl border-2 border-sport/20">
                        <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1">
                            {t(currentExerciseConfig?.name || 'scan.exercises')}
                        </p>
                        <p className="text-4xl md:text-6xl font-extrabold text-sport tracking-tight">
                            {counter.count}
                        </p>
                    </div>
                </div>

                {/* Indicateur de source */}
                {camera.isActive && (
                    <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${camera.videoSource === 'camera' ? 'bg-red-500 animate-pulse' : 'bg-sport'}`}></span>
                        {t('scan.source')}: {camera.videoSource === 'camera' ? t('scan.live') : t('scan.file')}
                    </div>
                )}

                {/* Zone vidéo / Canvas */}
                <div
                    style={isFullScreen ? fullScreenContainerStyle : {}}
                    className={!isFullScreen ? "relative w-full max-w-2xl mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800" : ""}
                >
                    <button
                        onClick={toggleFullScreen}
                        className="absolute top-4 right-4 z-10 px-3 py-1 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors text-sm font-bold flex items-center gap-1"
                        title={isFullScreen ? t('scan.btnExitFullScreen') : t('scan.btnFullScreen')}
                    >
                        {isFullScreen ? (
                            <>
                                <X className="w-4 h-4" />
                                <span>Quitter</span>
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-4 h-4" />
                                <span>Plein écran</span>
                            </>
                        )}
                    </button>

                    {isFullScreen && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-sport/30">
                            <span className="text-sport-secondary font-bold text-2xl">{counter.count}</span>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="hidden h-full w-full object-fit"
                    />
                    <canvas
                        ref={canvasRef}
                        style={isFullScreen ? fullScreenCanvasStyle : { width: '100%', height: '100%', objectFit: 'contain' }}
                        className="block"
                    />

                    {!camera.isActive && !isLoadingDetector && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                            <p className="text-lg">{t('scan.waitingVideo')}</p>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                {currentExerciseConfig && (
                    <div className="mt-6 md:mt-8 bg-white p-4 md:p-6 rounded-xl shadow-md w-full max-w-3xl border border-gray-100">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-sport" /> {t('scan.instructions')} : {t(currentExerciseConfig.name)}
                        </h3>
                        <ul className="space-y-3">
                            {t(currentExerciseConfig.instructions, { returnObjects: true }).map((instruction, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm md:text-base text-gray-600">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-sport rounded-full flex-shrink-0"></span>
                                    {instruction}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 pt-4 border-t border-gray-100 text-xs md:text-sm text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
                            <span>{t('scan.thresholds')} : Bas &lt; {currentExerciseConfig.thresholds.down}°</span>
                            <span>Haut &gt; {currentExerciseConfig.thresholds.up}°</span>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={camera.handleFileChange}
                    className="hidden"
                />
            </main>
            <Footer />
        </div>
    );
}

export default ScanExo;
