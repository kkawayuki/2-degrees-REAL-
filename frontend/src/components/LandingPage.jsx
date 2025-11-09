import { useEffect, useRef, useState } from "react";
import "./LandingPage.css";

function LandingPage({ onTelescopeClick, showTelescopeState }) {
	const earthRef = useRef(null);
	const sceneRef = useRef(null);
	const autoRotationRef = useRef(0);
	const animationFrameRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0 });
	const [initialRotation, setInitialRotation] = useState(0);
	const [rotation, setRotation] = useState(0);
	const [currentRotation, setCurrentRotation] = useState(0);

	// Automatic rotation animation
	useEffect(() => {
		if (isDragging) {
			// Stop auto-rotation while dragging
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			return;
		}
		
		const rotationSpeed = 0.15; // degrees per frame (faster rotation)
		let lastTime = performance.now();
		let isRunning = true;
		
		const animate = (currentTime) => {
			if (!isRunning || !earthRef.current) {
				return;
			}
			
			const deltaTime = currentTime - lastTime;
			const deltaRotation = (deltaTime / 16.67) * rotationSpeed; // Normalize to ~60fps
			autoRotationRef.current += deltaRotation;
			
			const totalRotation = rotation + autoRotationRef.current;
			setCurrentRotation(totalRotation);
			
			lastTime = currentTime;
			animationFrameRef.current = requestAnimationFrame(animate);
		};
		
		animationFrameRef.current = requestAnimationFrame(animate);
		
		return () => {
			isRunning = false;
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, [isDragging, rotation]);

	useEffect(() => {
		if (earthRef.current && sceneRef.current) {
			// Earth rotates on its own axis (spins around its center)
			earthRef.current.style.transform = `translate(-50%, -50%) rotate(${-90 + currentRotation}deg)`;
			
			// Time-rewind effect with motion blur
			if (isDragging) {
				const rotationSpeed = Math.abs(currentRotation - initialRotation);
				const blurAmount = Math.min(rotationSpeed * 0.1, 5);
				const brightness = 1 + Math.min(rotationSpeed * 0.01, 0.15);
				sceneRef.current.style.filter = `blur(${blurAmount}px) brightness(${brightness})`;
				sceneRef.current.style.transition = 'filter 0.1s ease-out';
			} else {
				sceneRef.current.style.filter = 'blur(0px) brightness(1)';
				sceneRef.current.style.transition = 'filter 0.3s ease-out';
			}
		}
	}, [currentRotation, isDragging, initialRotation]);

	const handleMouseDown = (e) => {
		if (e.target.closest('.content') || e.target.closest('.corner-button')) return;
		setIsDragging(true);
		setDragStart({ x: e.clientX });
		setInitialRotation(rotation);
	};

	const handleMouseMove = (e) => {
		if (!isDragging) return;
		e.preventDefault();
		
		const deltaX = (e.clientX - dragStart.x) * 0.5;
		const newRotation = initialRotation + deltaX;
		
		setCurrentRotation(newRotation);
	};

	const handleMouseUp = () => {
		if (isDragging) {
			setRotation(currentRotation);
			autoRotationRef.current = 0; // Reset auto-rotation offset
			setIsDragging(false);
		}
	};

	const handleTouchStart = (e) => {
		if (e.target.closest('.content') || e.target.closest('.corner-button')) return;
		const touch = e.touches[0];
		setIsDragging(true);
		setDragStart({ x: touch.clientX });
		setInitialRotation(rotation);
	};

	const handleTouchMove = (e) => {
		if (!isDragging) return;
		e.preventDefault();
		const touch = e.touches[0];
		const deltaX = (touch.clientX - dragStart.x) * 0.5;
		const newRotation = initialRotation + deltaX;
		
		setCurrentRotation(newRotation);
	};

	const handleTouchEnd = () => {
		if (isDragging) {
			setRotation(currentRotation);
			autoRotationRef.current = 0; // Reset auto-rotation offset
			setIsDragging(false);
		}
	};

	return (
		<div 
			className="landing-page"
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
		>
			<div className="scene" ref={sceneRef}>
				<div className="sky"></div>
				<div className={`earth ${showTelescopeState ? 'telescope-mode' : ''}`} ref={earthRef}>
					<img src="/globe.png" alt="Earth Globe" className="earth-globe" />
				</div>
			</div>
			
			{/* Bottom left button - Person (no functionality) */}
			<button className="corner-button corner-button-left">
				<svg width="122" height="122" viewBox="0 0 122 122" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="2" y="2" width="118" height="118" rx="18" fill="url(#paint7_linear_left)" stroke="#3C7EE7" strokeWidth="4"/>
					<path fillRule="evenodd" clipRule="evenodd" d="M46.6667 45.083C46.6667 41.282 48.1768 37.636 50.865 34.948C53.553 32.26 57.199 30.75 61 30.75C64.801 30.75 68.447 32.26 71.135 34.948C73.823 37.636 75.333 41.282 75.333 45.083C75.333 48.885 73.823 52.531 71.135 55.219C68.447 57.907 64.801 59.417 61 59.417C57.199 59.417 53.553 57.907 50.865 55.219C48.1768 52.531 46.6667 48.885 46.6667 45.083ZM46.6667 66.583C41.9149 66.583 37.3577 68.471 33.9977 71.831C30.6376 75.191 28.75 79.748 28.75 84.5C28.75 87.351 29.8826 90.085 31.8986 92.101C33.9146 94.117 36.6489 95.25 39.5 95.25H82.5C85.351 95.25 88.085 94.117 90.101 92.101C92.117 90.085 93.25 87.351 93.25 84.5C93.25 79.748 91.362 75.191 88.002 71.831C84.642 68.471 80.085 66.583 75.333 66.583H46.6667Z" fill="#3D3D3D"/>
					<defs>
						<linearGradient id="paint7_linear_left" x1="61" y1="95" x2="61" y2="28" gradientUnits="userSpaceOnUse">
							<stop stopColor="#F7FBFF"/>
							<stop offset="1" stopColor="#8DC3FF"/>
						</linearGradient>
					</defs>
				</svg>
			</button>
			
			{/* Bottom right button - Telescope */}
			<button className="corner-button corner-button-right" onClick={onTelescopeClick}>
				<svg width="122" height="122" viewBox="0 0 122 122" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="2" y="2" width="118" height="118" rx="18" fill="url(#paint6_linear_right)" stroke="#3C7EE7" strokeWidth="4"/>
					<path d="M82.91 28.541C84.61 27.587 85.72 26.971 86.6 26.619C87.43 26.289 87.8 26.308 88.05 26.37C88.29 26.436 88.61 26.59 89.15 27.276C89.73 28.005 90.37 29.072 91.35 30.722L95.4 37.528C96.38 39.178 97.01 40.248 97.38 41.099C97.71 41.898 97.69 42.228 97.63 42.441C97.57 42.657 97.42 42.962 96.71 43.493C95.95 44.058 94.85 44.681 93.15 45.635L78.73 53.709C77.13 54.611 76.08 55.19 75.26 55.516C74.49 55.824 74.17 55.799 73.98 55.744C73.77 55.692 73.49 55.56 72.98 54.911C72.43 54.222 71.82 53.206 70.89 51.633L66.56 44.37C65.6 42.753 64.98 41.704 64.63 40.875C64.3 40.094 64.32 39.775 64.38 39.577C64.43 39.379 64.57 39.09 65.25 38.58C65.98 38.03 67.04 37.432 68.7 36.505L82.91 28.541ZM48.67 49.983L61.32 42.903C61.78 43.867 62.43 44.956 63.17 46.188L67.62 53.668C68.29 54.798 68.89 55.806 69.47 56.631L63.79 59.806L79.11 95.703C79.25 96.049 79.33 96.422 79.33 96.798C79.33 97.174 79.26 97.546 79.12 97.894C78.97 98.242 78.76 98.558 78.5 98.824C78.23 99.09 77.91 99.3 77.57 99.443C76.86 99.74 76.07 99.746 75.35 99.46C74.64 99.175 74.08 98.62 73.77 97.918L61 67.983L48.23 97.918C47.92 98.62 47.36 99.173 46.65 99.459C45.94 99.744 45.14 99.739 44.44 99.443C44.09 99.3 43.77 99.09 43.51 98.824C43.24 98.558 43.03 98.242 42.89 97.894C42.74 97.546 42.67 97.174 42.67 96.798C42.67 96.422 42.75 96.049 42.9 95.703L56.45 63.92C54.98 64.745 54 65.284 53.22 65.596C52.44 65.904 52.13 65.878 51.93 65.827C51.73 65.772 51.44 65.64 50.93 64.991C50.38 64.302 49.77 63.286 48.84 61.713L46.54 57.848C45.57 56.235 44.96 55.186 44.6 54.354C44.27 53.573 44.3 53.258 44.35 53.06C44.41 52.858 44.54 52.572 45.23 52.059C45.95 51.512 47.02 50.911 48.67 49.987" fill="#3D3D3D"/>
					<path d="M41.3 56.385L28.85 63.359C27.15 64.313 26.05 64.936 25.29 65.497C24.58 66.032 24.43 66.337 24.37 66.549C24.31 66.762 24.29 67.092 24.62 67.891C24.98 68.742 25.62 69.816 26.6 71.466C27.58 73.116 28.22 74.183 28.8 74.913C29.35 75.599 29.66 75.756 29.91 75.819C30.16 75.885 30.52 75.899 31.35 75.569C32.23 75.217 33.34 74.601 35.04 73.648L47.42 66.711C46.84 65.889 46.25 64.877 45.57 63.752L43.14 59.671C42.41 58.439 41.76 57.35 41.3 56.385Z" fill="#3D3D3D"/>
					<defs>
						<linearGradient id="paint6_linear_right" x1="61" y1="95" x2="61" y2="28" gradientUnits="userSpaceOnUse">
							<stop stopColor="#F7FBFF"/>
							<stop offset="1" stopColor="#8DC3FF"/>
						</linearGradient>
					</defs>
				</svg>
			</button>
		</div>
	);
}

export default LandingPage;
