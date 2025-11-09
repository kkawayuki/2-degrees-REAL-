import { useEffect, useRef, useState } from "react";
import "./LandingPage.css";
import ProfilePage from "./ProfilePage";

// Array of common internet phrases
const casualMessages = [
	"no cap",
	"that's fire 🔥",
	"fr fr",
	"slay",
	"periodt",
	"that's valid",
	"mood",
	"facts",
	"based",
	"this hits different",
	"vibe check",
	"say less",
	"bet",
	"lowkey",
	"highkey",
	"it's giving",
	"not me",
	"bestie",
	"slaps",
	"go off",
	"iconic",
	"stan",
	"no notes",
	"chef's kiss 👌",
	"that's the tea",
	"spill the tea",
	"main character energy",
	"plot twist",
	"we love to see it",
	"we don't deserve this"
];

function LandingPage({ onTelescopeClick, showTelescopeState, currentUsername }) {
	const earthRef = useRef(null);
	const sceneRef = useRef(null);
	const starsRef = useRef(null);
	const autoRotationRef = useRef(0);
	const animationFrameRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0 });
	const [initialRotation, setInitialRotation] = useState(0);
	const [rotation, setRotation] = useState(0);
	const [currentRotation, setCurrentRotation] = useState(0);
	const [shootingStars, setShootingStars] = useState([]);
	const [showProfile, setShowProfile] = useState(false);
	const [userProfile, setUserProfile] = useState(null);
	const [profileStarPosition, setProfileStarPosition] = useState({ x: 0, y: 0 });
	const [profilePlanetTarget, setProfilePlanetTarget] = useState({ x: 0, y: 0 });
	const [starOrbitTargets, setStarOrbitTargets] = useState([]);
	const [starPositions, setStarPositions] = useState([]);

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

	// Generate stars avoiding the globe and buttons
	useEffect(() => {
		const starsContainer = starsRef.current;
		if (!starsContainer) return;

		starsContainer.innerHTML = '';

		// Define the tytle.svg path for large stars
		const tytlePath = 'M105.7 66.7C82.8467 79.4439 80.0688 73.5261 62.7002 105.7C50.8164 90.0478 52.0385 77.613 23.7002 63.7C47.4678 55.8739 58.4375 43.7 65.7506 23.7C73.0637 47.1783 78.3691 57.6678 105.7 66.7Z';

		// Star positions - avoiding center (globe) and bottom corners (buttons)
		const positions = [
			// Top area stars
			{ x: 15, y: 15, type: 'large', size: 35 },
			{ x: 85, y: 10, type: 'large', size: 40 },
			{ x: 25, y: 8, type: 'large', size: 30 },
			{ x: 70, y: 20, type: 'large', size: 38 },
			{ x: 45, y: 12, type: 'large', size: 32 },
			
			// Side areas (avoiding globe in center)
			{ x: 8, y: 45, type: 'large', size: 36 },
			{ x: 92, y: 48, type: 'large', size: 34 },
			{ x: 12, y: 65, type: 'large', size: 33 },
			{ x: 88, y: 62, type: 'large', size: 37 },
			
			// Small stars scattered around
			{ x: 20, y: 25, type: 'small' },
			{ x: 60, y: 18, type: 'small' },
			{ x: 78, y: 32, type: 'small' },
			{ x: 10, y: 55, type: 'small' },
			{ x: 90, y: 75, type: 'small' },
			{ x: 35, y: 85, type: 'small' },
			{ x: 65, y: 82, type: 'small' },
			{ x: 50, y: 5, type: 'small' },
			{ x: 95, y: 35, type: 'small' },
			{ x: 5, y: 78, type: 'small' },
		];

		// Store star positions with pixel coordinates
		const positionsWithPx = positions.map((star, index) => {
			const leftPx = (star.x / 100) * window.innerWidth;
			const topPx = (star.y / 100) * window.innerHeight;
			return { ...star, index, leftPx, topPx };
		});
		setStarPositions(positionsWithPx);

		positionsWithPx.forEach((star, index) => {
			if (star.type === 'large') {
				const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("class", "star star-large");
				svg.setAttribute("viewBox", "0 0 130 130");
				svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
				
				svg.style.position = "absolute";
				svg.style.left = `${star.x}%`;
				svg.style.top = `${star.y}%`;
				svg.style.width = `${star.size}px`;
				svg.style.height = `${star.size}px`;
				svg.style.transform = "translate(-50%, -50%)";
				svg.dataset.index = index.toString();
				
				// Add orbit animation classes when profile is open
				if (showProfile && starOrbitTargets[index]) {
					const translateX = starOrbitTargets[index].x - star.leftPx;
					const translateY = starOrbitTargets[index].y - star.topPx;
					svg.style.setProperty('--translate-x', `${translateX}px`);
					svg.style.setProperty('--translate-y', `${translateY}px`);
					svg.style.setProperty('--star-speed', `${0.6 + (index % 5) * 0.1}s`);
					svg.style.setProperty('--star-delay', `${(index % 7) * 0.03}s`);
					svg.classList.add('star-swirl-away');
				} else {
					svg.classList.remove('star-swirl-away');
				}
				
				const filterId = `landingStarGlow${index}`;
				
				const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
				const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
				filter.setAttribute("id", filterId);
				filter.setAttribute("x", "0.00019455");
				filter.setAttribute("y", "1.14441e-05");
				filter.setAttribute("width", "129.4");
				filter.setAttribute("height", "129.4");
				filter.setAttribute("filterUnits", "userSpaceOnUse");
				filter.setAttribute("color-interpolation-filters", "sRGB");
				
				const feFlood = document.createElementNS("http://www.w3.org/2000/svg", "feFlood");
				feFlood.setAttribute("flood-opacity", "0");
				feFlood.setAttribute("result", "BackgroundImageFix");
				
				const feColorMatrix1 = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
				feColorMatrix1.setAttribute("in", "SourceAlpha");
				feColorMatrix1.setAttribute("type", "matrix");
				feColorMatrix1.setAttribute("values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0");
				feColorMatrix1.setAttribute("result", "hardAlpha");
				
				const feOffset = document.createElementNS("http://www.w3.org/2000/svg", "feOffset");
				
				const feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
				feGaussianBlur.setAttribute("stdDeviation", "11.85");
				
				const feComposite = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
				feComposite.setAttribute("in2", "hardAlpha");
				feComposite.setAttribute("operator", "out");
				
				const feColorMatrix2 = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
				feColorMatrix2.setAttribute("type", "matrix");
				feColorMatrix2.setAttribute("values", "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.49 0");
				
				const feBlend1 = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
				feBlend1.setAttribute("mode", "normal");
				feBlend1.setAttribute("in2", "BackgroundImageFix");
				feBlend1.setAttribute("result", "effect1_dropShadow");
				
				const feBlend2 = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
				feBlend2.setAttribute("mode", "normal");
				feBlend2.setAttribute("in", "SourceGraphic");
				feBlend2.setAttribute("in2", "effect1_dropShadow");
				feBlend2.setAttribute("result", "shape");
				
				filter.appendChild(feFlood);
				filter.appendChild(feColorMatrix1);
				filter.appendChild(feOffset);
				filter.appendChild(feGaussianBlur);
				filter.appendChild(feComposite);
				filter.appendChild(feColorMatrix2);
				filter.appendChild(feBlend1);
				filter.appendChild(feBlend2);
				defs.appendChild(filter);
				svg.appendChild(defs);
				
				const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
				g.setAttribute("filter", `url(#${filterId})`);
				
				const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute("d", tytlePath);
				path.setAttribute("fill", "white");
				g.appendChild(path);
				svg.appendChild(g);
				
				starsContainer.appendChild(svg);
			} else {
				const starElement = document.createElement("div");
				starElement.className = "star star-small";
				
				starElement.style.left = `${star.x}%`;
				starElement.style.top = `${star.y}%`;
				starElement.dataset.index = index.toString();
				
				// Add orbit animation classes when profile is open
				if (showProfile && starOrbitTargets[index]) {
					const translateX = starOrbitTargets[index].x - star.leftPx;
					const translateY = starOrbitTargets[index].y - star.topPx;
					starElement.style.setProperty('--translate-x', `${translateX}px`);
					starElement.style.setProperty('--translate-y', `${translateY}px`);
					starElement.style.setProperty('--star-speed', `${0.6 + (index % 5) * 0.1}s`);
					starElement.style.setProperty('--star-delay', `${(index % 7) * 0.03}s`);
					starElement.classList.add('star-swirl-away');
				} else {
					starElement.classList.remove('star-swirl-away');
				}
				
				starsContainer.appendChild(starElement);
			}
		});
	}, [showProfile, starOrbitTargets]);

	// Create shooting stars with messages
	useEffect(() => {
		// Pause shooting stars when profile is open
		if (showProfile) return;

		const createShootingStar = () => {
			const message = casualMessages[Math.floor(Math.random() * casualMessages.length)];
			
			// Start from top left corner, move diagonally down-right
			// Move starting position down by 5% of viewport height
			const startX = -50; // Start left of viewport
			const startY = -50 + (window.innerHeight * 0.05); // Start above viewport + 5% down
			const endX = window.innerWidth + 100; // End off right edge
			const endY = window.innerHeight + 100; // End below viewport (bottom right)

			// Calculate angle for the trail (diagonal movement)
			const dx = endX - startX;
			const dy = endY - startY;
			const angle = Math.atan2(dy, dx) * (180 / Math.PI);

			const id = Date.now() + Math.random();
			const newStar = {
				id,
				message,
				startX,
				startY,
				endX,
				endY,
				angle,
			};

			setShootingStars(prev => [...prev, newStar]);

			// Remove star after animation completes (6 seconds - 50% slower)
			setTimeout(() => {
				setShootingStars(prev => prev.filter(star => star.id !== id));
			}, 6000);
		};

		// Create first shooting star immediately
		createShootingStar();

		// Then create one every 5 seconds
		const interval = setInterval(createShootingStar, 5000);

		return () => clearInterval(interval);
	}, [showProfile]);

	// Handle profile button click
	const handleProfileClick = async () => {
		if (!currentUsername) return;

		// Get button position for animation
		const button = document.querySelector('.corner-button-left');
		if (button) {
			const rect = button.getBoundingClientRect();
			const starPos = {
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2
			};
			setProfileStarPosition(starPos);
			
			// Target position for planet (left side of screen)
			const target = {
				x: window.innerWidth * 0.25,
				y: window.innerHeight * 0.5
			};
			setProfilePlanetTarget(target);

			// Calculate orbit positions for stars around the planet (same as Universe)
			const orbitTargets = starPositions.map((star, idx) => {
				const angle = ((idx + 2) / starPositions.length) * Math.PI * 2;
				const radius = 180 + ((idx % 6) * 25);
				return {
					x: target.x + Math.cos(angle) * radius,
					y: target.y + Math.sin(angle) * radius,
				};
			});
			setStarOrbitTargets(orbitTargets);
		}

		// Fetch user profile data
		try {
			const response = await fetch(`http://localhost:8000/demo/users/${currentUsername}`);
			if (response.ok) {
				const userData = await response.json();
				// Transform to match ProfilePage expected format
				setUserProfile({
					username: userData.username,
					name: userData.name,
					profilePicture: userData.profilePicture || userData.profile_image_url,
					bio: userData.bio || userData.description,
					degree: 0, // Current user is degree 0 (self)
					public_metrics: userData.public_metrics
				});
				setShowProfile(true);
			} else {
				console.error('Failed to fetch user profile');
			}
		} catch (error) {
			console.error('Error fetching user profile:', error);
		}
	};

	const handleCloseProfile = () => {
		setShowProfile(false);
		setUserProfile(null);
		setStarOrbitTargets([]);
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
			{/* Stars layer - scrolls with this page */}
			<div className="landing-page-stars" ref={starsRef}></div>
			
			<div className="scene" ref={sceneRef}>
				<div className="sky"></div>
				<div className={`earth ${showTelescopeState ? 'telescope-mode' : ''} ${showProfile ? 'fade-out' : 'fade-in'}`} ref={earthRef}>
					<img src="/globe.png" alt="Earth Globe" className="earth-globe" />
				</div>
			</div>
			
			{/* Bottom left button - Person (profile) */}
			<button className="corner-button corner-button-left" onClick={handleProfileClick}>
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

			{/* Shooting stars with messages */}
			{shootingStars.map((star) => (
				<div
					key={star.id}
					className="shooting-star-container"
					style={{
						'--start-x': `${star.startX}px`,
						'--start-y': `${star.startY}px`,
						'--end-x': `${star.endX}px`,
						'--end-y': `${star.endY}px`,
						'--angle': `${star.angle}deg`,
					}}
				>
					<div className="shooting-star">
						<div className="shooting-star-trail"></div>
					</div>
					<div className="shooting-star-message">{star.message}</div>
				</div>
			))}

			{/* Profile page overlay */}
			{showProfile && userProfile && (
				<ProfilePage 
					friend={userProfile} 
					onClose={handleCloseProfile}
					starPosition={profileStarPosition}
					planetTarget={profilePlanetTarget}
					isCurrentUser={true}
				/>
			)}
		</div>
	);
}

export default LandingPage;
