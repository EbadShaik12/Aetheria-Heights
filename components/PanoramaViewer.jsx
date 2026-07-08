import React, { useRef, useState } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

const PanoramaViewer = ({ imageUrl, images, onClose }) => {
    const imageList = images && images.length > 0 ? images : (imageUrl ? [imageUrl] : []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const viewerRef = useRef(null);

    const handleReady = (instance) => {
        viewerRef.current = instance;
    };

    const move = (yawDelta, pitchDelta) => {
        if (viewerRef.current) {
            const pos = viewerRef.current.getPosition();
            viewerRef.current.animate({
                yaw: pos.yaw + yawDelta,
                pitch: pos.pitch + pitchDelta,
                speed: 1500,
            });
        }
    };

    const zoom = (delta) => {
        if (viewerRef.current) {
            const current = viewerRef.current.getZoomLevel();
            viewerRef.current.animate({ zoom: current + delta, speed: 1500 });
        }
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
        viewerRef.current = null;
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % imageList.length);
        viewerRef.current = null;
    };

    const hasMultiple = imageList.length > 1;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="relative w-full h-full md:w-[90%] md:h-[90%] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-sm p-2 px-3 rounded-lg pointer-events-auto">
                        <h3 className="text-white font-bold text-sm">360° View</h3>
                        <p className="text-gray-400 text-xs">
                            {hasMultiple
                                ? `Photo ${currentIndex + 1} of ${imageList.length} · Drag to explore`
                                : 'Drag to explore · Use controls to move'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-black/50 hover:bg-red-500 text-white rounded-full transition-all pointer-events-auto border border-white/20 hover:border-red-400 shadow-lg"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Dot indicators */}
                {hasMultiple && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex gap-2 pointer-events-auto">
                        {imageList.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setCurrentIndex(i); viewerRef.current = null; }}
                                className={`w-2.5 h-2.5 rounded-full border transition-all duration-200 ${
                                    i === currentIndex
                                        ? 'bg-yellow-400 border-yellow-400 scale-125'
                                        : 'bg-white/30 border-white/40 hover:bg-white/70'
                                }`}
                                title={`Photo ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* PREV button */}
                {hasMultiple && (
                    <button
                        onClick={goToPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-black/70 hover:bg-yellow-400 hover:text-black text-white rounded-full transition-all border border-white/20 hover:border-yellow-400 shadow-2xl backdrop-blur-sm font-semibold text-sm"
                        title="Previous Photo"
                    >
                        <ChevronLeft size={22} />
                        <span className="hidden sm:inline">Prev</span>
                    </button>
                )}

                {/* NEXT button */}
                {hasMultiple && (
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-black/70 hover:bg-yellow-400 hover:text-black text-white rounded-full transition-all border border-white/20 hover:border-yellow-400 shadow-2xl backdrop-blur-sm font-semibold text-sm"
                        title="Next Photo"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={22} />
                    </button>
                )}

                {/* Move + Zoom Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 pointer-events-auto">
                    <div className="bg-black/50 backdrop-blur p-2 rounded-full border border-white/10 grid grid-cols-3 gap-1">
                        <div />
                        <button onClick={() => move(0, 0.3)} className="p-2 bg-white/10 hover:bg-yellow-400 hover:text-black text-white rounded-full transition-colors" title="Look Up"><ArrowUp size={20} /></button>
                        <div />
                        <button onClick={() => move(-0.5, 0)} className="p-2 bg-white/10 hover:bg-yellow-400 hover:text-black text-white rounded-full transition-colors" title="Turn Left"><ArrowLeft size={20} /></button>
                        <div className="w-9 h-9 flex items-center justify-center text-yellow-400 font-bold text-xs select-none">MOVE</div>
                        <button onClick={() => move(0.5, 0)} className="p-2 bg-white/10 hover:bg-yellow-400 hover:text-black text-white rounded-full transition-colors" title="Turn Right"><ArrowRight size={20} /></button>
                        <div />
                        <button onClick={() => move(0, -0.3)} className="p-2 bg-white/10 hover:bg-yellow-400 hover:text-black text-white rounded-full transition-colors" title="Look Down"><ArrowDown size={20} /></button>
                        <div />
                    </div>
                    <div className="bg-black/50 backdrop-blur p-2 rounded-full border border-white/10 flex flex-col gap-2 justify-center">
                        <button onClick={() => zoom(20)} className="p-2 bg-white/10 hover:bg-yellow-400 hover:text-black text-white rounded-full transition-colors" title="Zoom In"><ZoomIn size={20} /></button>
                        <button onClick={() => zoom(-20)} className="p-2 bg-white/10 hover:bg-yellow-400 hover:text-black text-white rounded-full transition-colors" title="Zoom Out"><ZoomOut size={20} /></button>
                    </div>
                </div>

                {/* The 360 Viewer */}
                <ReactPhotoSphereViewer
                    key={currentIndex}
                    src={imageList[currentIndex]}
                    height="100%"
                    width="100%"
                    container=""
                    onReady={handleReady}
                    loadingTxt="Loading 360° View..."
                    defaultZoomLvl={50}
                    touchmoveTwoFingers={true}
                    mousewheelCtrlKey={false}
                />
            </div>
        </div>
    );
};

export default PanoramaViewer;
