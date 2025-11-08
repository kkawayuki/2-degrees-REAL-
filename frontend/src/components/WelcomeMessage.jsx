/**
 * A simple React component that displays a welcome message.
 * 
 * Components are reusable pieces of UI. This one accepts a "name" prop
 * and displays a personalized greeting.
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - The name to greet
 */
function WelcomeMessage({ name }) {
	return (
		<div style={{ padding: "20px", backgroundColor: "#f0f0f0", borderRadius: "8px", margin: "10px 0" }}>
			<h2>Welcome, {name}!</h2>
			<p>This is a custom React component you created.</p>
		</div>
	);
}

// Always export your component so it can be imported elsewhere
export default WelcomeMessage;

