import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import "./App.css";
import Navbar from "./components/navbar/navbar";
import Router from "./components/router/router";
import Footer from "./components/footer/footer";
import Cookie from "react-cookies";

/**
 * This is the Main App component, bootstraping all the other components.
 * This is a stateful component.
 */
export default withRouter(
	class App extends Component {
		/**
		 * First method called on instantiating the component.
		 * Responsible for initializing the user session, from cookie
		 * if present, else a fresh user session.
		 *
		 * @param {Object} props Arguments that are passed to the component
		 */
		constructor(props) {
			super(props);

			let user_session_data = Cookie.load("user_session");

			if (user_session_data) {
				this.state = {
					user_session: user_session_data,
					user_name: ""
				};
			} else {
				this.state = {
					user_session: {
						isAuthenticated: false,
						expires_in: 0,
						access_token: 0,
						refresh_token: 0,
						update_time: 0
					},

					user_name: ""
				};
			}
			console.log(this.state.user_session);
		}

		/**
		 * Responsible for generating a new access token, when the current access token expires, and save it as a cookie.
		 * If not possible, then logout and start a fresh session.
		 */
		refresh_token = () => {
			let user_session_data = Cookie.load("user_session");
			if (user_session_data) {
				fetch("https://api.codechef.com/oauth/token", {
					method: "POST",
					headers: {
						"content-Type": "application/json"
					},
					body: JSON.stringify({
						grant_type: "refresh_token",
						refresh_token: user_session_data.refresh_token,
						client_id: "c05ec8e1ed3b1e305a62308a140bb50b",
						client_secret: "8990a3aeae4b9746f3ec00ffc2930780"
					})
				})
					.then(res => {
						if (res.ok) {
							return res.json();
						} else {
							throw new Error(res.status);
						}
					})
					.then(
						result => {
							this.setState({
								user_session: {
									isAuthenticated: true,
									expires_in: result.result.data.expires_in,
									access_token:
										result.result.data.access_token,
									refresh_token:
										result.result.data.refresh_token,
									update_time: Date.now()
								}
							});

							Cookie.save(
								"user_session",
								this.state.user_session,
								{
									path: "/",
									maxAge: 604800,
									expires: new Date(Date.now() + 604800000)
								}
							);

							this.getUserName(false);
						},
						error => {
							console.log(error.message);
							this.logout();
						}
					);
			}
		};

		/**
		 * Responsible for setting the storing the user session in a cookie after
		 * the user is successfully logged in using the Codechef OAuth.
		 *
		 * @param {Object} response Contains the response object sent from Codechef containing the tokens.
		 */
		login = response => {
			this.setState({
				user_session: {
					isAuthenticated: true,
					expires_in: response.result.data.expires_in,
					access_token: response.result.data.access_token,
					refresh_token: response.result.data.refresh_token,
					update_time: Date.now()
				}
			});
			Cookie.save("user_session", this.state.user_session, {
				path: "/",
				maxAge: 6048000,
				expires: new Date(Date.now() + 604800000)
			});
		};

		/**
		 * Responsible for logging out the currently logged in user and clear the session cookies.
		 */
		logout = () => {
			Cookie.remove("user_session", { path: "/" });
			Cookie.remove("user_name", { path: "/" });
			this.setState({
				user_session: {
					isAuthenticated: false,
					expires_in: 0,
					access_token: 0,
					refresh_token: 0,
					update_time: 0
				},

				user_name: ""
			});
		};

		/**
		 * Responsible for getting the username from the codechef API.
		 */
		getUserName = firstTime => {
			fetch("https://api.codechef.com/users/me", {
				headers: {
					Accept: "application/json",
					Authorization:
						"Bearer " + this.state.user_session.access_token
				}
			})
				.then(res => {
					if (res.ok) {
						return res.json();
					} else {
						throw new Error(res.status);
					}
				})
				.then(
					result => {
						this.setState({
							user_name: result.result.data.content.username
						});
						Cookie.save("user_name", this.state.user_name, {
							path: "/",
							maxAge: 6048000,
							expires: new Date(Date.now() + 604800000)
						});
					},
					error => {
						if (error.message == 401 && firstTime) {
							this.refresh_token();
							this.getUserName(!firstTime);
						}
					}
				);
		};

		/**
		 * Called after a component is successfully mounted
		 */
		componentDidMount() {
			if (this.state.user_session.isAuthenticated) {
				this.getUserName(true);
			}
		}

		/**
		 * The method is called when component is updated to DOM.
		 *
		 * @param {Object} prevProps The props before update
		 * @param {Object} prevState The state before update
		 * @param {Object} snapshot Value returned by getSnapshotBeforeUpdate() lifecycle method, if used.
		 */
		componentDidUpdate(prevProps, prevState, snapshot) {
			if (
				this.state.user_session.isAuthenticated &&
				!prevState.user_session.isAuthenticated
			) {
				this.getUserName(true);
			}
		}

		/**
		 * Responsible for rendering the component to the DOM.
		 */
		render() {
			return (
				<div className="App">
					<Navbar
						isAuthenticated={
							this.state.user_session.isAuthenticated
						}
						username={this.state.user_name}
						login={this.login}
						logout={this.logout}
					>
						{" "}
					</Navbar>{" "}
					<Router
						isAuthenticated={
							this.state.user_session.isAuthenticated
						}
						user_session={this.state.user_session}
						logout={this.logout}
						refresh_token={this.refresh_token}
						username={this.state.user_name}
					>
						{" "}
					</Router>{" "}
					<Footer></Footer>
				</div>
			);
		}
	}
);
