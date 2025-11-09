import { useState, useEffect, useRef } from "react";
import "./App.css";
import LandingPage from "./components/LandingPage";

function App() {
	const [showLandingPage, setShowLandingPage] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [showIntermediateState, setShowIntermediateState] = useState(false);
	const fixedStarsRef = useRef(null);

	// Exact star positions from SVG (in SVG coordinates: 1280x832) - same as landing page
	const starPositions = [
		{ x: 158.946, y: 407.721, type: 'large', path: 'M158.946 407.721C147.144 407.401 147.429 404.465 133.279 412.946C132.274 404.136 135.613 399.593 127.823 387.667C138.847 390.106 145.908 387.91 153.353 381.835C150.781 392.629 150.423 397.921 158.946 407.721Z' },
		{ x: 587, y: 276.695, type: 'large', path: 'M587 276.695C573.344 284.31 571.684 280.774 561.305 300C554.204 290.647 554.934 283.216 538 274.902C552.203 270.226 558.758 262.951 563.128 251C567.498 265.03 570.668 271.298 587 276.695Z' },
		{ x: 269.775, y: 107.768, type: 'large', path: 'M269.775 107.768C260.919 108.956 260.777 106.728 251.232 114.775C249.416 108.314 251.361 104.517 244.1 96.5492C252.631 97.0386 257.64 94.5446 262.467 89.1065C261.851 97.4807 262.223 101.477 269.775 107.768Z' },
		{ x: 967, y: 373.22, type: 'large', path: 'M967 373.22C953.065 380.99 951.371 377.382 940.78 397C933.534 387.456 934.279 379.874 917 371.39C931.492 366.618 938.181 359.195 942.64 347C947.1 361.316 950.335 367.712 967 373.22Z' },
		{ x: 1169.84, y: 141.699, type: 'large', path: 'M1169.84 141.699C1161.43 149.992 1159.51 147.753 1155.83 163.835C1148.78 158.459 1147.81 152.904 1133.81 150.265C1143.21 144.001 1146.51 137.386 1147.29 127.809C1153.29 137.138 1156.86 141.061 1169.84 141.699Z' },
		{ x: 1097.46, y: 273.825, type: 'large', path: 'M1097.46 273.825C1093.04 278.183 1092.03 277.006 1090.1 285.456C1086.39 282.631 1085.88 279.713 1078.53 278.326C1083.47 275.034 1085.2 271.559 1085.61 266.527C1088.76 271.429 1090.64 273.49 1097.46 273.825Z' },
		{ x: 802.755, y: 86.8992, type: 'large', path: 'M802.755 86.8992C798.139 92.2397 796.889 90.9962 795.457 100.755C791 97.8852 790.161 94.6205 781.694 93.7107C786.995 89.5323 788.652 85.4337 788.659 79.689C792.68 84.9647 794.994 87.1336 802.755 86.8992Z' },
		{ x: 177, y: 189, type: 'small', r: 2 },
		{ x: 356, y: 395, type: 'small', r: 2 },
		{ x: 212, y: 546, type: 'small', r: 2 },
		{ x: 61, y: 608, type: 'small', r: 2 },
		{ x: 487, y: 125, type: 'small', r: 2 },
		{ x: 870, y: 207, type: 'small', r: 2 },
		{ x: 1150, y: 572, type: 'small', r: 2 },
	];

	// Create fixed stars that stay in place during transition
	useEffect(() => {
		const starsContainer = fixedStarsRef.current;
		if (!starsContainer) return;

		starsContainer.innerHTML = '';

		starPositions.forEach((star, index) => {
			if (star.type === 'large' && star.path) {
				const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("class", "star star-large");
				svg.setAttribute("viewBox", "0 0 1280 832");
				svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
				
				const xPercent = (star.x / 1280) * 100;
				const yPercent = (star.y / 832) * 100;
				svg.style.position = "absolute";
				svg.style.left = `${xPercent}%`;
				svg.style.top = `${yPercent}%`;
				svg.style.width = "40px";
				svg.style.height = "40px";
				svg.style.transform = "translate(-50%, -50%)";
				
				const filterId = `starGlow${index}`;
				const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute("d", star.path);
				path.setAttribute("fill", "white");
				path.setAttribute("filter", `url(#${filterId})`);
				svg.appendChild(path);
				
				const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
				const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
				filter.setAttribute("id", filterId);
				filter.setAttribute("x", "-50%");
				filter.setAttribute("y", "-50%");
				filter.setAttribute("width", "200%");
				filter.setAttribute("height", "200%");
				
				const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
				blur.setAttribute("stdDeviation", "11.85");
				const colorMatrix = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
				colorMatrix.setAttribute("type", "matrix");
				colorMatrix.setAttribute("values", "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.49 0");
				
				filter.appendChild(blur);
				filter.appendChild(colorMatrix);
				defs.appendChild(filter);
				svg.appendChild(defs);
				
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
	}, []);

	const handleGetStarted = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setShowLandingPage(true);
		}, 800); // Match transition duration
	};

	const handleTelescopeClick = () => {
		setShowIntermediateState(true);
	};

	return (
		<div className="app-container">
			{/* Fixed stars layer - stays in place during transition */}
			<div className="fixed-stars" ref={fixedStarsRef}></div>
			
			<div className={`page-wrapper main-page ${isTransitioning || showLandingPage ? 'slide-out' : ''}`}>
				<div className="landing-page">
					<div className="content-group">
						<h1 className="headline">2ND DEGREE</h1>
						<img src="/tytle.svg" alt="Star" className="star-tytle" />
						<img src="/tytle.svg" alt="Star" className="star-n" />
						<div className="button-group">
							<div className="button-bg"></div>
							<button className="cta-button" onClick={handleGetStarted}>Get started →</button>
						</div>
					</div>
				</div>
			</div>
			
			<div className={`page-wrapper landing-page-wrapper ${isTransitioning || showLandingPage ? 'slide-in' : ''}`}>
				<LandingPage 
					onTelescopeClick={handleTelescopeClick} 
					showTelescopeState={showIntermediateState} 
				/>
			</div>
		</div>
	);
}

export default App;
