import { useState, useEffect } from "react";
import "./MutualsView.css";

function MutualsView({ friend, stars, selectedStarIndex, starPosition, onClose, isExiting: externalIsExiting, onVisitPlanet, onViewMutuals }) {
	const [showMars, setShowMars] = useState(false);
	const [showStars, setShowStars] = useState(false);
	const [showEarth, setShowEarth] = useState(false);
	const [showConstellation, setShowConstellation] = useState(false);
	const [isExiting, setIsExiting] = useState(false);
	const [marsPosition, setMarsPosition] = useState({ x: 0, y: 0 });
	const [earthPosition, setEarthPosition] = useState({ x: 0, y: 0 });
	const [hoveredFriend, setHoveredFriend] = useState(null);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
	const [tooltipBelow, setTooltipBelow] = useState(false);

	// Sync with external isExiting prop
	useEffect(() => {
		if (externalIsExiting) {
			setIsExiting(true);
		}
	}, [externalIsExiting]);

	// Calculate planet positions
	useEffect(() => {
		if (typeof window !== "undefined") {
			setMarsPosition({ x: window.innerWidth * 0.27, y: window.innerHeight * 0.5 });
			setEarthPosition({ x: window.innerWidth * 0.73, y: window.innerHeight * 0.5 });
		}
	}, []);

	// First, collect all large stars to position them in a clean constellation pattern
	const largeStars = stars
		.map((star, index) => ({ star, index }))
		.filter(({ star, index }) => index !== selectedStarIndex && star.isLarge);

	// Calculate orbit positions for stars around both planets
	const starOrbitPositions = stars.map((star, index) => {
		if (index === selectedStarIndex) return null;
		if (marsPosition.x === 0 && marsPosition.y === 0) return null; // Wait for positions to be calculated

		// For larger stars, position them between the two planets in an organic constellation pattern
		if (star.isLarge) {
			const centerX = (marsPosition.x + earthPosition.x) / 2;
			const centerY = marsPosition.y;
			
			// Find this star's index in the large stars array
			const largeStarIndex = largeStars.findIndex(({ index: idx }) => idx === index);
			const totalLargeStars = largeStars.length;
			
			// Create an organic constellation pattern - irregular spacing and natural curves
			// Use a seed based on the star's original index for consistent but varied positioning
			const seed = index * 137.5; // Golden angle for natural distribution
			const randomX = Math.sin(seed) * 100; // Increased from 60 to 100 for wider spread
			const randomY = Math.cos(seed) * 80;
			
			if (totalLargeStars <= 1) {
				// Single star - center it with slight variation
				return {
					x: centerX + randomX * 0.5, // Increased from 0.3 to 0.5
					y: centerY + randomY * 0.3,
					planet: 'between',
				};
			} else {
				// Multiple stars - create organic constellation pattern with even distribution
				const progress = largeStarIndex / (totalLargeStars - 1);
				
				// Use more even vertical spacing to avoid clustering in the middle
				const baseVerticalSpacing = 110; // More consistent spacing
				const totalHeight = (totalLargeStars - 1) * baseVerticalSpacing;
				const startY = centerY - totalHeight / 2;
				// Even vertical distribution
				const baseY = startY + largeStarIndex * baseVerticalSpacing;
				
				// Create organic horizontal curve with more even distribution
				// Use smoother curves to avoid clustering
				const primaryCurve = Math.sin(progress * Math.PI * 1.5) * 75;
				const secondaryCurve = Math.cos(progress * Math.PI * 2.3) * 40;
				// Reduce random offset to prevent clustering
				const organicOffset = randomX * 0.3; // Reduced from 0.6 to 0.3 for more even distribution
				
				// Reduce vertical variation to prevent clustering
				const verticalVariation = randomY * 0.15; // Reduced from 0.3 to 0.15
				
				return {
					x: centerX + primaryCurve + secondaryCurve + organicOffset,
					y: baseY + verticalVariation,
					planet: 'between',
				};
			}
		}

		// For smaller stars, alternate between orbiting Mars and Earth
		const orbitPlanet = index % 2 === 0 ? marsPosition : earthPosition;
		const angle = ((index * 137.5) % 360) * (Math.PI / 180);
		const radius = 150 + ((index % 6) * 30);

		return {
			x: orbitPlanet.x + Math.cos(angle) * radius,
			y: orbitPlanet.y + Math.sin(angle) * radius,
			planet: index % 2 === 0 ? 'mars' : 'earth',
		};
	});

	useEffect(() => {
		// Wait for positions to be calculated before starting animations
		if (marsPosition.x === 0 && marsPosition.y === 0) return;

		// Start Mars animation immediately
		setShowMars(true);
		
		// Start stars shifting after a short delay
		setTimeout(() => {
			setShowStars(true);
		}, 300);

		// Show Earth after Mars starts moving
		setTimeout(() => {
			setShowEarth(true);
		}, 600);

		// Show constellation lines after stars have moved to their positions
		setTimeout(() => {
			setShowConstellation(true);
		}, 1500); // After stars have mostly moved
	}, [marsPosition]);

	// Handle exit animation when isExiting prop changes
	useEffect(() => {
		if (onClose && isExiting) {
			// Hide constellation first
			setShowConstellation(false);
			// Wait for reverse animation to complete before calling onClose
			const timer = setTimeout(() => {
				if (onClose) onClose();
			}, 2000); // Match the longest animation duration
			return () => clearTimeout(timer);
		}
	}, [isExiting, onClose]);

	// Get large stars positioned between planets for constellation
	const constellationStars = stars
		.map((star, index) => {
			if (index === selectedStarIndex) return null;
			if (!star.isLarge) return null;
			const orbitPos = starOrbitPositions[index];
			if (!orbitPos || orbitPos.planet !== 'between') return null;
			// The orbitPos is the center position where the star will be after animation
			// Stars start at top-left (leftPx, topPx) and translate to center (orbitPos.x, orbitPos.y)
			// So the center position is orbitPos.x, orbitPos.y
			const centerX = orbitPos.x;
			const centerY = orbitPos.y;
			return {
				index,
				starIndex: index,
				position: { x: centerX, y: centerY },
				size: star.size,
				originalPosition: { x: star.leftPx, y: star.topPx },
			};
		})
		.filter(Boolean);

	// Create constellation connections - organic pattern like real constellations
	const constellationLines = [];
	if (constellationStars.length > 1) {
		// Sort stars by their vertical position (top to bottom) for consistent pattern
		const sortedStars = [...constellationStars].sort((a, b) => a.position.y - b.position.y);
		
		const numStars = sortedStars.length;
		
		// Create organic constellation pattern - connect nearby stars naturally
		// Real constellations have irregular connections, not all stars connected
		
		if (numStars === 2) {
			// Two stars - connect them
			constellationLines.push({
				from: sortedStars[0].position,
				to: sortedStars[1].position,
			});
		} else if (numStars === 3) {
			// Three stars - connect in a natural pattern (not all connected)
			constellationLines.push({
				from: sortedStars[0].position,
				to: sortedStars[1].position,
			});
			constellationLines.push({
				from: sortedStars[1].position,
				to: sortedStars[2].position,
			});
		} else {
			// Four or more stars - create organic constellation pattern with even connections
			// Connect stars in a more structured way to avoid clustering
			
			// First, connect sequential stars to create a base path
			for (let i = 0; i < sortedStars.length - 1; i++) {
				constellationLines.push({
					from: sortedStars[i].position,
					to: sortedStars[i + 1].position,
				});
			}
			
			// Then add strategic cross-connections, but limit them to avoid clustering
			// Only connect stars that are not too close together
			for (let i = 0; i < sortedStars.length; i++) {
				const currentStar = sortedStars[i];
				
				// Find nearby stars, but with a minimum distance to avoid clustering
				const nearbyStars = sortedStars
					.map((star, idx) => ({ star, idx, distance: Math.sqrt(
						Math.pow(star.position.x - currentStar.position.x, 2) +
						Math.pow(star.position.y - currentStar.position.y, 2)
					)}))
					.filter(({ idx, distance }) => 
						idx !== i && 
						distance >= 100 && // Minimum distance to avoid clustering
						distance < 300 && // Maximum distance
						Math.abs(idx - i) > 1 // Skip immediate neighbors (already connected)
					)
					.sort((a, b) => a.distance - b.distance)
					.slice(0, 1); // Only connect to 1 additional neighbor to avoid too many lines
				
				// Add connections to nearby stars
				nearbyStars.forEach(({ star }) => {
					// Avoid duplicate connections
					const exists = constellationLines.some(line => 
						(line.from.x === currentStar.position.x && line.from.y === currentStar.position.y &&
						 line.to.x === star.position.x && line.to.y === star.position.y) ||
						(line.from.x === star.position.x && line.from.y === star.position.y &&
						 line.to.x === currentStar.position.x && line.to.y === currentStar.position.y)
					);
					
					if (!exists) {
						constellationLines.push({
							from: currentStar.position,
							to: star.position,
						});
					}
				});
			}
		}
	}

	// Find the star data for the hovered friend to get years
	const getStarYears = (friend) => {
		const star = stars.find(s => s.friend.username === friend.username);
		return star ? star.years : 5;
	};

	const handleStarClick = (friend, event, starIndex) => {
		// Stop propagation to prevent background click
		event.stopPropagation();
		
		// Toggle tooltip - if clicking same star, close it
		if (hoveredFriend && hoveredFriend.username === friend.username) {
			setHoveredFriend(null);
			return;
		}

		setHoveredFriend(friend);
		
		// Get the star's current position after animation
		const orbitPos = starOrbitPositions[starIndex];
		if (!orbitPos) return;
		
		// Get the star element to calculate tooltip position
		const starElement = stars[starIndex];
		const starSize = starElement?.size || 40;
		
		// Calculate tooltip position based on star's center position
		const starCenterX = orbitPos.x;
		const starCenterY = orbitPos.y;
		
		const viewportHeight = window.innerHeight;
		const starTopPercent = (starCenterY / viewportHeight) * 100;
		
		// If star is in top 20% of viewport, show tooltip below
		const showBelow = starTopPercent < 20;
		setTooltipBelow(showBelow);
		
		setTooltipPosition({
			x: starCenterX,
			y: showBelow ? starCenterY + starSize / 2 + 10 : starCenterY - starSize / 2 - 10,
		});
	};

	// Close tooltip when clicking on the background
	const handleBackgroundClick = () => {
		setHoveredFriend(null);
	};

	const handleVisitPlanetFromMutuals = () => {
		if (!hoveredFriend || !onVisitPlanet) return;
		
		// Find the star index
		const starIndex = stars.findIndex(s => s.friend.username === hoveredFriend.username);
		if (starIndex === -1) return;
		
		// Get the star's current position after animation
		const orbitPos = starOrbitPositions[starIndex];
		if (!orbitPos) return;
		
		const starElement = stars[starIndex];
		const starSize = starElement?.size || 40;
		
		// Calculate star center position
		const starCenterX = orbitPos.x;
		const starCenterY = orbitPos.y;
		
		// Close tooltip
		setHoveredFriend(null);
		
		// Close mutuals view first
		setIsExiting(true);
		setTimeout(() => {
			if (onClose) onClose();
			// Then trigger visit planet with the star position
			if (onVisitPlanet) {
				onVisitPlanet(hoveredFriend, { x: starCenterX, y: starCenterY });
			}
		}, 500); // Short delay to allow exit animation to start
	};

	const handleViewMutualsFromMutuals = () => {
		if (!hoveredFriend || !onViewMutuals) return;
		
		// Find the star index
		const starIndex = stars.findIndex(s => s.friend.username === hoveredFriend.username);
		if (starIndex === -1) return;
		
		// Get the star's current position after animation
		const orbitPos = starOrbitPositions[starIndex];
		if (!orbitPos) return;
		
		const starElement = stars[starIndex];
		const starSize = starElement?.size || 40;
		
		// Calculate star center position
		const starCenterX = orbitPos.x;
		const starCenterY = orbitPos.y;
		
		// Close tooltip
		setHoveredFriend(null);
		
		// Close current mutuals view first
		setIsExiting(true);
		setTimeout(() => {
			if (onClose) onClose();
			// Then trigger view mutuals with the star position
			if (onViewMutuals) {
				onViewMutuals(hoveredFriend, { x: starCenterX, y: starCenterY });
			}
		}, 500); // Short delay to allow exit animation to start
	};

	return (
		<div className="mutuals-view-overlay" onClick={handleBackgroundClick}>
			{/* Constellation lines connecting large stars */}
			{constellationLines.length > 0 && (
				<svg className="constellation-lines" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }}>
					{constellationLines.map((line, idx) => {
						// Find the star data for both endpoints to get their sizes
						const fromStar = constellationStars.find(s => s.position.x === line.from.x && s.position.y === line.from.y);
						const toStar = constellationStars.find(s => s.position.x === line.to.x && s.position.y === line.to.y);
						
						// The positions are already center positions, so use them directly
						// But we need to make sure they match the actual star centers after animation
						// Since stars translate from top-left to center, the orbit positions should be centers
						const fromX = line.from.x;
						const fromY = line.from.y;
						const toX = line.to.x;
						const toY = line.to.y;
						
						return (
							<line
								key={`constellation-line-${idx}`}
								x1={fromX}
								y1={fromY}
								x2={toX}
								y2={toY}
								stroke="white"
								strokeWidth="2"
								strokeOpacity="0.6"
								className={`constellation-line ${showConstellation && !isExiting ? 'constellation-line-appear' : isExiting ? 'constellation-line-disappear' : ''}`}
								style={{
									'--line-delay': `${idx * 0.1}s`,
								}}
							/>
						);
					})}
				</svg>
			)}

			{/* Background stars that shift around planets */}
			{stars.map((star, index) => {
				if (index === selectedStarIndex) return null;

				const orbitPos = starOrbitPositions[index];
				if (!orbitPos) return null;

				return star.isLarge ? (
					<svg
						key={`mutual-star-${index}`}
						className={`mutual-star-large mutual-star-interactive ${isExiting ? 'star-orbit-reverse' : showStars ? 'star-orbit' : ''}`}
						style={{
							position: 'absolute',
							top: star.top,
							left: star.left,
							width: `${star.size}px`,
							height: `${star.size}px`,
							'--start-x': `${star.leftPx}px`,
							'--start-y': `${star.topPx}px`,
							// Adjust target to account for star size - orbitPos is center, so top-left should be at center - size/2
							'--target-x': `${orbitPos.x - star.size / 2}px`,
							'--target-y': `${orbitPos.y - star.size / 2}px`,
							'--orbit-delay': `${(index % 5) * 0.1}s`,
							'--orbit-duration': `${1.2 + (index % 3) * 0.2}s`,
						}}
						viewBox="0 0 130 130"
						fill="none"
						onClick={(e) => handleStarClick(star.friend, e, index)}
					>
						<defs>
							<filter id={`mutual-star-filter-${index}`} x="0.00019455" y="1.14441e-05" width="129.4" height="129.4" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
								<feFlood floodOpacity="0" result="BackgroundImageFix"/>
								<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
								<feOffset/>
								<feGaussianBlur stdDeviation="11.85"/>
								<feComposite in2="hardAlpha" operator="out"/>
								<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.49 0"/>
								<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
								<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
							</filter>
						</defs>
						<g filter={`url(#mutual-star-filter-${index})`}>
							<path d="M105.7 66.7C82.8467 79.4439 80.0688 73.5261 62.7002 105.7C50.8164 90.0478 52.0385 77.613 23.7002 63.7C47.4678 55.8739 58.4375 43.7 65.7506 23.7C73.0637 47.1783 78.3691 57.6678 105.7 66.7Z" fill="white"/>
						</g>
					</svg>
				) : (
					<div
						key={`mutual-star-${index}`}
						className={`mutual-star-small ${isExiting ? 'star-orbit-reverse' : showStars ? 'star-orbit' : ''}`}
						style={{
							position: 'absolute',
							top: star.top,
							left: star.left,
							'--start-x': `${star.leftPx}px`,
							'--start-y': `${star.topPx}px`,
							'--target-x': `${orbitPos.x}px`,
							'--target-y': `${orbitPos.y}px`,
							'--orbit-delay': `${(index % 5) * 0.1}s`,
							'--orbit-duration': `${1.2 + (index % 3) * 0.2}s`,
						}}
					/>
				);
			})}

			{/* Mars planet - enlarges from star position */}
			{showMars && (
				<div 
					className="mars-container"
					style={{
						'--start-x': `${starPosition.x}px`,
						'--start-y': `${starPosition.y}px`,
						'--target-x': `${marsPosition.x}px`,
						'--target-y': `${marsPosition.y}px`,
					}}
				>
					<img src="/Group 14.png" alt="Mars" className={`mars-image-expanding ${isExiting ? 'mars-shrink-reverse' : ''}`} />
				</div>
			)}

			{/* Earth planet - appears on the right */}
			{showEarth && (
				<div 
					className="earth-container"
					style={{
						'--target-x': `${earthPosition.x}px`,
						'--target-y': `${earthPosition.y}px`,
					}}
				>
					<img src="/globe.png" alt="Earth" className={`earth-image ${isExiting ? 'earth-disappear-reverse' : ''}`} />
				</div>
			)}

			{/* Tooltip */}
			{hoveredFriend && (
				<div
					className={`star-tooltip ${tooltipBelow ? 'tooltip-below' : 'tooltip-above'}`}
					style={{
						left: `${tooltipPosition.x}px`,
						top: `${tooltipPosition.y}px`,
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="tooltip-content">
						<div className="tooltip-main">
							<div className="tooltip-left">
								<div className="tooltip-name">{hoveredFriend.username.charAt(0).toUpperCase() + hoveredFriend.username.slice(1)}</div>
								<div className="tooltip-quote">"{hoveredFriend.bio}"</div>
								<div className="tooltip-connection">
									<div className="connection-icon"></div>
									<span>Strong Connection</span>
								</div>
								<div className="tooltip-duration">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<path d="M6 2V8H6L10 12L6 16V22H18V16L14 12L18 8V2H6ZM16 6.5V7.5L14.5 9L13.5 8L16 6.5ZM8 6.5L10.5 8L9.5 9L8 7.5V6.5ZM8 17.5L9.5 16L10.5 17L8 18.5V17.5ZM16 17.5V18.5L13.5 17L14.5 16L16 17.5ZM12 10.5C13.38 10.5 14.5 11.62 14.5 13C14.5 14.38 13.38 15.5 12 15.5C10.62 15.5 9.5 14.38 9.5 13C9.5 11.62 10.62 10.5 12 10.5Z" fill="#666666"/>
									</svg>
									<span>{getStarYears(hoveredFriend)}+ years</span>
								</div>
								<div className="tooltip-buttons">
									<button className="tooltip-button" onClick={handleVisitPlanetFromMutuals}>Visit Planet</button>
									<button className="tooltip-button" onClick={handleViewMutualsFromMutuals}>View Mutuals</button>
								</div>
							</div>
							<div className="tooltip-right">
								<img
									src={hoveredFriend.profilePicture}
									alt={hoveredFriend.username}
									className="tooltip-profile-picture"
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Return button */}
			<div className="mutuals-return-button-container" onClick={(e) => {
				e.stopPropagation();
				if (onClose) {
					// Trigger exit animation
					setIsExiting(true);
				}
			}}>
				<div className="mutuals-return-button-icon">
					<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
						<path d="M25 10L15 20L25 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
					</svg>
				</div>
				<span className="mutuals-return-text">Return</span>
			</div>
		</div>
	);
}

export default MutualsView;

