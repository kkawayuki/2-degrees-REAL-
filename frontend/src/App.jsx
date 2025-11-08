import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Universe from "./components/Universe";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/universe" element={<Universe />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
