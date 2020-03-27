import React from "react";

import "./footer.css";

export default function Footer() {
	return (
		<footer className="site-footer">
			<div className="container">
				<div className="row">
					<div className="col-sm-12 col-md-6">
						<h6>About</h6>
						<p className="text-justify">
							Contest Arena{" "}
							<i>AN ONLINE BATTLEGROUND FOR CODECHEF</i> is a
							project made using the React JS framework for
							frontend and PHP Slim framework as the backend. It
							has an OAUTH login system by codechef and fetches
							all the data with the codechef API. You can load,
							code, test and submit (mock) the problems from
							several codechef contests here. Hope you like it and
							thanks a ton for reading through all these! Be safe
							and best of luck.
						</p>
					</div>
					<div className="col-xs-6 col-md-3">
						<h6>Connect with me!</h6>
						<ul className="footer-links">
							<li>
								<a href="https://twitter.com/debarun_m1997">
									Twitter
								</a>
							</li>
							<li>
								<a href="https://github.com/debarunmukherjee">
									Github
								</a>
							</li>
							<li>
								<a href="https://www.codechef.com/users/puny_coder">
									Codechef
								</a>
							</li>
							<li>
								<a href="https://www.linkedin.com/in/debarun-mukherjee-a518a114b/">
									Linked In
								</a>
							</li>
						</ul>
					</div>
					<div className="col-xs-6 col-md-3">
						<h6>Quick Links</h6>
						<ul className="footer-links">
							<li>
								<a href="#about-us">About Us</a>
							</li>
							<li>
								<a href="#features">Features</a>
							</li>
							<li>
								<a href="#github-link-of-project">Contribute</a>
							</li>
							<li>
								<a href="https://www.codechef.com/">Codechef</a>
							</li>
						</ul>
					</div>
				</div>
				<hr />
			</div>
			<div className="container">
				<div className="row">
					<div className="col-md-8 col-sm-6 col-xs-12">
						<p className="copyright-text">
							Created with{" "}
							<i
								className="fa fa-heart"
								style={{ color: "red" }}
								aria-hidden="true"
							></i>{" "}
							by Debarun Mukherjee.
						</p>
					</div>
					<div className="col-md-4 col-sm-6 col-xs-12">
						<ul className="social-icons">
							<li>
								<a className="facebook" href="/#">
									<i className="fab fa-facebook-f"></i>
								</a>
							</li>
							<li>
								<a className="twitter" href="/#">
									<i className="fab fa-twitter"></i>
								</a>
							</li>
							<li>
								<a className="linkedin" href="/#">
									<i className="fab fa-linkedin-in"></i>
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	);
}
