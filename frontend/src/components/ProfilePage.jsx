import { useState, useEffect } from "react";
import "./ProfilePage.css";

function ProfilePage({ friend, onClose, starPosition, planetTarget }) {
	const [showGlobe, setShowGlobe] = useState(false);
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		// Show globe animation immediately from star position
		setShowGlobe(true);
		
		// Show content after globe reaches destination
		const contentTimer = setTimeout(() => {
			setShowContent(true);
		}, 1200);

		return () => {
			clearTimeout(contentTimer);
		};
	}, []);

	return (
		<div className="profile-page-overlay">
			{/* Split screen container */}
			<div className="split-screen-container">
				{/* Left side - Globe animation */}
				<div className="globe-side">
					{showGlobe && (
						<div 
							className="globe-container"
							style={{
								'--start-x': `${starPosition.x}px`,
								'--start-y': `${starPosition.y}px`,
								'--planet-target-x': `${planetTarget.x}px`,
								'--planet-target-y': `${planetTarget.y}px`,
							}}
						>
							<img src="/Group 14.png" alt="Mars" className="globe-image-expanding" />
						</div>
					)}
				</div>

				{/* Right side - Profile content */}
				<div className="content-side">
					{showContent && (
						<div className="profile-page-content">
							<div className="profile-card">
						<div className="profile-header">
							<h1 className="profile-name">{friend.username}</h1>
							<div className="social-icons">
								<img src="/insta.png" alt="Instagram" className="social-icon" />
								<img src="/x.png" alt="X" className="social-icon" />
								<img src="/spotify.png" alt="Spotify" className="social-icon" />
							</div>
						</div>

						<div className="profile-main">
							<div className="profile-left">
								<div className="top-mutuals">
									<div className="mutual-avatars">
										<img src="https://i.pravatar.cc/150?img=10" alt="Mutual 1" className="mutual-avatar" />
										<img src="https://i.pravatar.cc/150?img=11" alt="Mutual 2" className="mutual-avatar" />
										<img src="https://i.pravatar.cc/150?img=12" alt="Mutual 3" className="mutual-avatar" />
									</div>
									<span className="mutuals-label">top mutuals</span>
								</div>

								<div className="profile-images">
									<img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop" alt="Memory 1" className="memory-image" />
									<img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop" alt="Memory 2" className="memory-image" />
								</div>

								<div className="profile-quote">
									<p>"{friend.bio}"</p>
								</div>

								<div className="now-playing">
									<img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" alt="Album art" className="album-art" />
									<div className="song-info">
										<div className="song-icon">♫</div>
										<div>
											<div className="song-title">Ochos Rios</div>
											<div className="song-artist">Daniel Caesar</div>
										</div>
									</div>
								</div>
							</div>

							<div className="profile-right">
								<img src={friend.profilePicture} alt={friend.username} className="profile-avatar" />
							</div>
						</div>

						<button className="close-profile-button" onClick={onClose}>
							Back to Universe
						</button>
					</div>
				</div>
			)}
				</div>
			</div>
		</div>
	);
}

export default ProfilePage;

