import { useState, useEffect } from "react";
import "./ProfilePage.css";

function ProfilePage({ friend, onClose, starPosition, planetTarget, isClosing, isCurrentUser = false }) {
	const [showGlobe, setShowGlobe] = useState(false);
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		// Show globe animation immediately from star position
		setShowGlobe(true);
		
		// Show content after globe reaches destination (faster transition)
		const contentTimer = setTimeout(() => {
			setShowContent(true);
		}, 600);

		return () => {
			clearTimeout(contentTimer);
		};
	}, []);

	useEffect(() => {
		if (isClosing) {
			// Hide content immediately when closing
			setShowContent(false);
			// Keep globe visible for fade-out transition
			// The fade-out class will handle the opacity transition
		} else {
			// Reset showGlobe when not closing (for next open)
			if (!showGlobe) {
				setShowGlobe(true);
			}
		}
	}, [isClosing]);

	return (
		<div className="profile-page-overlay">
			{/* Return button - top left */}
			{showContent && (
				<button className="profile-return-button" onClick={onClose}>
					<img src="/fluent_arrow-left-12-filled.png" alt="Arrow" className="return-arrow-icon" />
					<img src="/Return.png" alt="Return" className="return-text-image" />
				</button>
			)}

			{/* Split screen container */}
			<div className="split-screen-container">
				{/* Left side - Globe animation */}
				<div className="globe-side">
					{showGlobe && (
						<div 
							className={`globe-container ${isClosing ? 'globe-fade-out' : ''}`}
							style={{
								'--start-x': `${starPosition.x}px`,
								'--start-y': `${starPosition.y}px`,
								'--planet-target-x': `${planetTarget.x}px`,
								'--planet-target-y': `${planetTarget.y}px`,
							}}
						>
							<img 
								src={isCurrentUser ? "/globe.png" : "/Group 14.png"} 
								alt={isCurrentUser ? "Earth" : "Mars"} 
								className={`globe-image-expanding ${isCurrentUser ? 'globe-earth' : 'globe-mars'}`}
							/>
						</div>
					)}
				</div>

				{/* Right side - Profile content */}
				<div className="content-side">
					{showContent && (
						<div className="profile-page-content">
							<div className="profile-card">
								{/* Grid layout */}
								<div className="profile-grid">
									{/* Row 1: Name and Social icons */}
									<h1 className="grid-name">{friend.username.charAt(0).toUpperCase() + friend.username.slice(1)}</h1>
									<div className="grid-social-icons">
										<img src="/insta.png" alt="Instagram" className="social-icon" />
										<img src="/x.png" alt="X" className="social-icon" />
										<img src="/spotify.png" alt="Spotify" className="social-icon" />
									</div>

									{/* Row 2: Top mutuals */}
									<div className="grid-mutuals">
										<div className="mutual-avatars">
											<img src="https://i.pravatar.cc/150?img=10" alt="Mutual 1" className="mutual-avatar" />
											<img src="https://i.pravatar.cc/150?img=11" alt="Mutual 2" className="mutual-avatar" />
											<img src="https://i.pravatar.cc/150?img=12" alt="Mutual 3" className="mutual-avatar" />
										</div>
										<span className="mutuals-label">top mutuals</span>
									</div>

									{/* Row 3: Images and Bio */}
									<img src="/chancy.png" alt="Chancy" className="grid-image grid-chancy" />
									<img src="/group picture.png" alt="Group" className="grid-image grid-group" />
									<div className="grid-quote">
										<div className="profile-quote">
											<p>"{friend.bio}"</p>
										</div>
									</div>

									{/* Row 4: Music and Avatar */}
									<div className="grid-music">
										<div className="now-playing">
											<img src="/ochos rios.png" alt="Album art" className="album-art" />
											<div className="song-info">
												<div className="song-icon">♫</div>
												<div>
													<div className="song-title">Ochos Rios</div>
													<div className="song-artist">Daniel Caesar</div>
												</div>
											</div>
										</div>
									</div>
									<img src={`https://i.pravatar.cc/300?img=${friend.username.length % 50}`} alt={friend.username} className="grid-image grid-avatar" />
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default ProfilePage;

