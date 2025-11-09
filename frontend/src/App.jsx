import { useState, useEffect, useRef } from "react";
import "./App.css";
import LandingPage from "./components/LandingPage";
import Universe from "./components/Universe";

function App() {
	const [showLandingPage, setShowLandingPage] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [showIntermediateState, setShowIntermediateState] = useState(false);
	const [showUniverse, setShowUniverse] = useState(false);
	const [isTransitioningToUniverse, setIsTransitioningToUniverse] = useState(false);
	const fixedStarsRef = useRef(null);
	const [shootingStars, setShootingStars] = useState([]);

	// Exact star positions from SVG (in SVG coordinates: 1280x832) - same as landing page
	// Using tytle.svg path for all large stars
	const tytlePath = 'M105.7 66.7C82.8467 79.4439 80.0688 73.5261 62.7002 105.7C50.8164 90.0478 52.0385 77.613 23.7002 63.7C47.4678 55.8739 58.4375 43.7 65.7506 23.7C73.0637 47.1783 78.3691 57.6678 105.7 66.7Z';
	
	const starPositions = [
		// Large stars with tytle.svg shape
		{ x: 158.946, y: 407.721, type: 'large', size: 40 },
		{ x: 587, y: 276.695, type: 'large', size: 45 },
		{ x: 269.775, y: 107.768, type: 'large', size: 35 },
		{ x: 967, y: 373.22, type: 'large', size: 42 },
		{ x: 1169.84, y: 141.699, type: 'large', size: 38 },
		{ x: 1097.46, y: 273.825, type: 'large', size: 30 },
		{ x: 802.755, y: 86.8992, type: 'large', size: 33 },
		{ x: 450, y: 680, type: 'large', size: 36 },
		{ x: 730, y: 520, type: 'large', size: 40 },
		{ x: 320, y: 580, type: 'large', size: 35 },
		{ x: 920, y: 650, type: 'large', size: 38 },
		{ x: 640, y: 140, type: 'large', size: 32 },
		
		// Small stars
		{ x: 177, y: 189, type: 'small', r: 2 },
		{ x: 356, y: 395, type: 'small', r: 2 },
		{ x: 212, y: 546, type: 'small', r: 2 },
		{ x: 61, y: 608, type: 'small', r: 2 },
		{ x: 487, y: 125, type: 'small', r: 2 },
		{ x: 870, y: 207, type: 'small', r: 2 },
		{ x: 1150, y: 572, type: 'small', r: 2 },
		{ x: 105, y: 320, type: 'small', r: 2 },
		{ x: 780, y: 420, type: 'small', r: 2 },
		{ x: 1080, y: 480, type: 'small', r: 2 },
		{ x: 420, y: 230, type: 'small', r: 2 },
		{ x: 560, y: 730, type: 'small', r: 2 },
		{ x: 1200, y: 340, type: 'small', r: 2 },
		{ x: 290, y: 720, type: 'small', r: 2 },
	];

	// Create fixed stars that stay in place during transition
	useEffect(() => {
		const starsContainer = fixedStarsRef.current;
		if (!starsContainer) return;

		starsContainer.innerHTML = '';

		starPositions.forEach((star, index) => {
			if (star.type === 'large') {
				const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("class", "star star-large");
				svg.setAttribute("viewBox", "0 0 130 130");
				svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
				
				const xPercent = (star.x / 1280) * 100;
				const yPercent = (star.y / 832) * 100;
				svg.style.position = "absolute";
				svg.style.left = `${xPercent}%`;
				svg.style.top = `${yPercent}%`;
				svg.style.width = `${star.size}px`;
				svg.style.height = `${star.size}px`;
				svg.style.transform = "translate(-50%, -50%)";
				
				const filterId = `starGlow${index}`;
				
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
				starElement.className = `star star-${star.type}`;
				
				const xPercent = (star.x / 1280) * 100;
				const yPercent = (star.y / 832) * 100;
				
				starElement.style.left = `${xPercent}%`;
				starElement.style.top = `${yPercent}%`;
				
				starsContainer.appendChild(starElement);
			}
		});
	}, [tytlePath, starPositions]);

	// Create shooting stars (no messages) from top right to bottom left
	useEffect(() => {
		if (showLandingPage || isTransitioning) return; // Only show on main page

		const createShootingStar = () => {
			// Start from top right, move diagonally to bottom left
			const startX = window.innerWidth + 50; // Start right of viewport
			const startY = -50; // Start above viewport (top right)
			const endX = -100; // End left of viewport
			const endY = window.innerHeight + 100; // End below viewport (bottom left)

			// Calculate angle for the trail (diagonal movement from top-right to bottom-left)
			const dx = endX - startX;
			const dy = endY - startY;
			const angle = Math.atan2(dy, dx) * (180 / Math.PI);

			const id = Date.now() + Math.random();
			const newStar = {
				id,
				startX,
				startY,
				endX,
				endY,
				angle,
			};

			setShootingStars(prev => [...prev, newStar]);

			// Remove star after animation completes (6 seconds)
			setTimeout(() => {
				setShootingStars(prev => prev.filter(star => star.id !== id));
			}, 6000);
		};

		// Create first shooting star immediately
		createShootingStar();

		// Then create one every 5 seconds
		const interval = setInterval(createShootingStar, 5000);

		return () => clearInterval(interval);
	}, [showLandingPage, isTransitioning]);

	const handleGetStarted = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setShowLandingPage(true);
		}, 1200); // Match transition duration
	};

	const handleTelescopeClick = () => {
		setShowIntermediateState(true);
		// First, add the universe page to DOM
		setShowUniverse(true);
		// Then trigger the transition after a brief delay
		setTimeout(() => {
			setIsTransitioningToUniverse(true);
		}, 50); // Small delay to ensure DOM update
	};

	const handleReturnClick = () => {
		setIsTransitioningToUniverse(false);
		setTimeout(() => {
			setShowUniverse(false);
			setShowIntermediateState(false);
		}, 1200); // Match transition duration
	};

	return (
		<div className="app-container">
			<div className={`page-wrapper main-page ${isTransitioning || showLandingPage ? 'slide-out' : ''}`}>
				{/* Stars layer - scrolls with this page */}
				<div className="main-page-stars" ref={fixedStarsRef}></div>
				
				{/* Shooting stars (no messages) from top right to bottom left */}
				{shootingStars.map((star) => (
					<div
						key={star.id}
						className="main-shooting-star-container"
						style={{
							'--start-x': `${star.startX}px`,
							'--start-y': `${star.startY}px`,
							'--end-x': `${star.endX}px`,
							'--end-y': `${star.endY}px`,
							'--angle': `${star.angle}deg`,
						}}
					>
						<div className="main-shooting-star">
							<div className="main-shooting-star-trail"></div>
						</div>
					</div>
				))}
				
				<div className="landing-page">
					<div className="content-group">
						<h1 className="headline">Shared Sky</h1>
						<img src="/tytle.svg" alt="Star" className="star-tytle" />
						<img src="/tytle.svg" alt="Star" className="star-n" />
						<div className="button-group">
							<div className="button-bg"></div>
							<button className="cta-button" onClick={handleGetStarted}>Get started →</button>
						</div>
					</div>
				</div>
			</div>
			
			<div className={`page-wrapper landing-page-wrapper ${isTransitioning || showLandingPage ? 'slide-in' : ''} ${isTransitioningToUniverse ? 'slide-out' : ''}`}>
				<LandingPage 
					onTelescopeClick={handleTelescopeClick} 
					showTelescopeState={showIntermediateState} 
				/>
			</div>
			
			{showUniverse && (
				<div className={`page-wrapper universe-page-wrapper ${isTransitioningToUniverse ? 'slide-in' : 'slide-out'}`}>
					<Universe onReturnClick={handleReturnClick} />
				</div>
			)}
		</div>
	);
}

export default App;
