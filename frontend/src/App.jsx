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
	const [firstUser, setFirstUser] = useState("");
	const [secondUser, setSecondUser] = useState("");
	const [firstUserError, setFirstUserError] = useState("");
	const fixedStarsRef = useRef(null);

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

	// Demo users available
	const demoUsers = ['alice', 'bob', 'charlie', 'diana', 'eve'];

	// Validate username matches demo users
	const validateUsername = (username) => {
		if (!username || username.trim() === "") {
			return "Username cannot be empty";
		}
		const trimmed = username.trim().toLowerCase();
		if (!demoUsers.includes(trimmed)) {
			return `Username must be one of: ${demoUsers.join(', ')}`;
		}
		return null; // Valid
	};

	const handleFirstUserSubmit = (e) => {
		e.preventDefault();
		const username = e.target.username.value.trim();
		const error = validateUsername(username);
		
		if (error) {
			setFirstUserError(error);
			return;
		}
		
		setFirstUserError("");
		setFirstUser(username.toLowerCase()); // Store in lowercase to match demo users
		setIsTransitioning(true);
		setTimeout(() => {
			setShowLandingPage(true);
		}, 1200); // Match transition duration
	};

	const handleSecondUserSubmit = (username) => {
		if (username) {
			setSecondUser(username);
			setShowIntermediateState(true);
			// First, add the universe page to DOM
			setShowUniverse(true);
			// Then trigger the transition after a brief delay
			setTimeout(() => {
				setIsTransitioningToUniverse(true);
			}, 50); // Small delay to ensure DOM update
		}
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
				
				<div className="landing-page">
					<div className="content-group">
						<h1 className="headline">2ND DEGREE</h1>
						<img src="/tytle.svg" alt="Star" className="star-tytle" />
						<img src="/tytle.svg" alt="Star" className="star-n" />
						<form className="button-group" onSubmit={handleFirstUserSubmit}>
							<div className="button-bg"></div>
							<input 
								type="text" 
								name="username"
								className={`cta-input ${firstUserError ? 'input-error' : ''}`}
								placeholder="enter a twitter handle (no @)"
								onChange={(e) => {
									if (firstUserError) {
										setFirstUserError("");
									}
								}}
								required
							/>
							<button type="submit" className="cta-button-submit">→</button>
							{firstUserError && (
								<div className="input-error-message">{firstUserError}</div>
							)}
						</form>
					</div>
				</div>
			</div>
			
			<div className={`page-wrapper landing-page-wrapper ${isTransitioning || showLandingPage ? 'slide-in' : ''} ${isTransitioningToUniverse ? 'slide-out' : ''}`}>
				<LandingPage 
					onSecondUserSubmit={handleSecondUserSubmit} 
					showTelescopeState={showIntermediateState}
					firstUser={firstUser}
				/>
			</div>
			
			{showUniverse && (
				<div className={`page-wrapper universe-page-wrapper ${isTransitioningToUniverse ? 'slide-in' : 'slide-out'}`}>
					<Universe onReturnClick={handleReturnClick} firstUser={firstUser} secondUser={secondUser} />
				</div>
			)}
		</div>
	);
}

export default App;
