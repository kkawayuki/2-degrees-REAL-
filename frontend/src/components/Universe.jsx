import { useState, useEffect, useMemo } from "react";
import "./Universe.css";

function Universe({ onReturnClick, firstUser, secondUser }) {
	const [hoveredFriend, setHoveredFriend] = useState(null);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
	const [tooltipBelow, setTooltipBelow] = useState(false);
	const [friendsData, setFriendsData] = useState([]);
	const [loading, setLoading] = useState(true);

	// Fetch mutuals data from API
	useEffect(() => {
		const fetchMutuals = async () => {
			if (!firstUser || !secondUser) return;
			
			setLoading(true);
			try {
				const response = await fetch(`/api/demo/mutuals?user1=${firstUser}&user2=${secondUser}`);
				if (response.ok) {
					const data = await response.json();
					// Transform mutuals data to match the friends format with degrees
					// All mutuals are 2nd degree connections
					const mutualsWithDegrees = data.mutuals.map((mutual, index) => ({
						username: mutual.username,
						profilePicture: mutual.profile_image_url,
						bio: mutual.description || "",
						degree: 2, // All mutuals are 2nd degree
						...mutual // Include all other data
					}));
					setFriendsData(mutualsWithDegrees);
				} else {
					console.error('Failed to fetch mutuals data');
					setFriendsData([]);
				}
			} catch (error) {
				console.error('Error fetching mutuals:', error);
				setFriendsData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchMutuals();
	}, [firstUser, secondUser]);

	// Generate stars procedurally based on friends data
	// Degree determines size: degree 1 = largest, 2 = medium, 3+ = smallest
	const stars = useMemo(() => {
		if (!friendsData || friendsData.length === 0) return [];
		
		return friendsData.map((friend, index) => {
			// Determine star size based on degree
			let size;
			let isLarge;
			
			if (friend.degree === 1) {
				// Largest stars for degree 1
				size = 40 + Math.random() * 20; // 40-60px
				isLarge = true;
			} else if (friend.degree === 2) {
				// Medium stars for degree 2
				size = 25 + Math.random() * 15; // 25-40px
				isLarge = true;
			} else {
				// Small dot stars for degree 3+
				size = 4;
				isLarge = false;
			}

			// Generate random position with margin to avoid edges and Return button
			const margin = 8; // 8% margin from edges
			const bottomMargin = 25; // Extra margin from bottom for Return button
			const topPercent = Math.random() * (100 - margin * 2 - bottomMargin) + margin;
			const leftPercent = Math.random() * (100 - margin * 2) + margin;
			
			// Calculate years based on degree (lower degree = more years)
			let years;
			if (friend.degree === 1) {
				years = Math.floor(Math.random() * 3) + 5; // 5-7
			} else if (friend.degree === 2) {
				years = Math.floor(Math.random() * 2) + 3; // 3-4
			} else {
				years = Math.floor(Math.random() * 2) + 1; // 1-2
			}
			
			return {
				friend,
				size,
				isLarge,
				top: `${topPercent}%`,
				left: `${leftPercent}%`,
				years,
			};
		});
	}, [friendsData]);

	const handleStarHover = (friend, event) => {
		setHoveredFriend(friend);
		const rect = event.currentTarget.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const starTopPercent = (rect.top / viewportHeight) * 100;
		
		// If star is in top 20% of viewport, show tooltip below
		const showBelow = starTopPercent < 20;
		setTooltipBelow(showBelow);
		
		setTooltipPosition({
			x: rect.left + rect.width / 2,
			y: showBelow ? rect.bottom + 10 : rect.top - 10,
		});
	};

	const handleStarMove = (event) => {
		if (hoveredFriend) {
			const rect = event.currentTarget.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const starTopPercent = (rect.top / viewportHeight) * 100;
			
			// If star is in top 20% of viewport, show tooltip below
			const showBelow = starTopPercent < 20;
			setTooltipBelow(showBelow);
			
			setTooltipPosition({
				x: rect.left + rect.width / 2,
				y: showBelow ? rect.bottom + 10 : rect.top - 10,
			});
		}
	};

	const handleStarLeave = () => {
		setHoveredFriend(null);
	};

	// Find the star data for the hovered friend to get years
	const getStarYears = (friend) => {
		const star = stars.find(s => s.friend.username === friend.username);
		return star ? star.years : 5;
	};

	// Format degree text for display
	const getDegreeText = (degree) => {
		if (degree === 1) {
			return "1st Degree Connection";
		} else if (degree === 2) {
			return "2nd Degree Connection";
		} else if (degree === 3) {
			return "3rd Degree Connection";
		} else {
			return `${degree}th Degree Connection`;
		}
	};

	if (loading) {
		return (
			<div className="universe-page">
				<div className="loading-message">Loading mutual connections...</div>
			</div>
		);
	}

	return (
		<div className="universe-page">
			{stars.map((star, index) => 
				star.isLarge ? (
					<svg
						key={`star-${index}`}
						className="star-large star-interactive"
						style={{
							position: 'absolute',
							top: star.top,
							left: star.left,
							width: `${star.size}px`,
							height: `${star.size}px`,
						}}
						viewBox="0 0 130 130"
						fill="none"
						onMouseEnter={(e) => handleStarHover(star.friend, e)}
						onMouseMove={(e) => handleStarMove(e)}
						onMouseLeave={handleStarLeave}
					>
						<defs>
							<filter id={`star-filter-${index}`} x="0.00019455" y="1.14441e-05" width="129.4" height="129.4" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
						<g filter={`url(#star-filter-${index})`}>
							<path d="M105.7 66.7C82.8467 79.4439 80.0688 73.5261 62.7002 105.7C50.8164 90.0478 52.0385 77.613 23.7002 63.7C47.4678 55.8739 58.4375 43.7 65.7506 23.7C73.0637 47.1783 78.3691 57.6678 105.7 66.7Z" fill="white"/>
						</g>
					</svg>
				) : (
					<div
						key={`star-${index}`}
						className="star-small star-interactive"
						style={{
							top: star.top,
							left: star.left,
						}}
						onMouseEnter={(e) => handleStarHover(star.friend, e)}
						onMouseMove={(e) => handleStarMove(e)}
						onMouseLeave={handleStarLeave}
					/>
				)
			)}

			{/* Tooltip */}
			{hoveredFriend && (
				<div
					className={`star-tooltip ${tooltipBelow ? 'tooltip-below' : 'tooltip-above'}`}
					style={{
						left: `${tooltipPosition.x}px`,
						top: `${tooltipPosition.y}px`,
					}}
				>
					<div className="tooltip-content">
						<div className="tooltip-main">
							<div className="tooltip-left">
								<div className="tooltip-name">{hoveredFriend.username}</div>
								<div className="tooltip-quote">"{hoveredFriend.bio}"</div>
								<div className="tooltip-connection">
									<div className="connection-icon"></div>
									<span>{getDegreeText(hoveredFriend.degree)}</span>
								</div>
								<div className="tooltip-duration">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<path d="M6 2V8H6L10 12L6 16V22H18V16L14 12L18 8V2H6ZM16 6.5V7.5L14.5 9L13.5 8L16 6.5ZM8 6.5L10.5 8L9.5 9L8 7.5V6.5ZM8 17.5L9.5 16L10.5 17L8 18.5V17.5ZM16 17.5V18.5L13.5 17L14.5 16L16 17.5ZM12 10.5C13.38 10.5 14.5 11.62 14.5 13C14.5 14.38 13.38 15.5 12 15.5C10.62 15.5 9.5 14.38 9.5 13C9.5 11.62 10.62 10.5 12 10.5Z" fill="#666666"/>
									</svg>
									<span>{getStarYears(hoveredFriend)}+ years</span>
								</div>
								<div className="tooltip-buttons">
									<button className="tooltip-button">Visit Planet</button>
									<button className="tooltip-button">View Mutuals</button>
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
			<div className="return-button-container" onClick={onReturnClick}>
				<div className="return-button-circle">
					<div className="return-button-icon">
						<svg width="59" height="59" viewBox="0 0 24 24" fill="none">
							<path d="M12 6L12 18M12 18L6 12M12 18L18 12" stroke="#333333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
						</svg>
					</div>
				</div>
				<span className="return-text">Return</span>
			</div>
		</div>
	);
}

export default Universe;
