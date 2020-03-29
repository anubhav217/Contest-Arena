import React from "react";

import { Link } from "react-router-dom";
import "./error404.css";

/**
 * A stateless component displaying the 404 message
 */
export default function Error404() {
	return (
		<div>
			<section className="error-container">
				<span>4</span>
				<span>
					<span className="screen-reader-text">0</span>
				</span>
				<span>4</span>
				<div className="link-container">
					<Link to="/contest" className="more-link">
						Go Back to contest page
					</Link>
				</div>
			</section>
		</div>
	);
}
