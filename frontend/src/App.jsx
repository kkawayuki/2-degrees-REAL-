import "./App.css";

function App() {
	// Generate evenly distributed background stars across the entire page
	const generateStars = () => {
		const stars = [];
		// Create more stars spread evenly across the entire viewport
		for (let i = 0; i < 80; i++) {
			stars.push({
				top: Math.random() * 100 + '%', // 0-100% of height
				left: Math.random() * 100 + '%', // 0-100% of width
				size: Math.random() * 2 + 3, // Vary size between 3-5px
				opacity: Math.random() * 0.5 + 0.5, // Vary opacity between 0.5-1
			});
		}
		return stars;
	};

	const backgroundStars = generateStars();

	return (
		<div className="landing-page">
			{/* Background stars */}
			{backgroundStars.map((star, index) => (
				<div 
					key={index} 
					className="star-dot" 
					style={{
						top: star.top,
						left: star.left,
						width: `${star.size}px`,
						height: `${star.size}px`,
						borderRadius: `${star.size / 2}px`,
						opacity: star.opacity,
					}} 
				/>
			))}
			
			<div className="content-group">
				<h1 className="headline">2ND DEGREE</h1>
				<img src="/tytle.svg" alt="Star" className="star-tytle" />
				<img src="/tytle.svg" alt="Star" className="star-n" />
				<div className="button-group">
					<div className="button-bg"></div>
					<button className="cta-button">Get started →</button>
				</div>
			</div>
		</div>
	);
}

export default App;
