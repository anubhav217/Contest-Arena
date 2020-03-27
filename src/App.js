import React, { Component } from "react";

import "./App.css";
import Navbar from "./components/navbar/navbar";
import Router from "./components/router/router";
import Footer from "./components/footer/footer";

export default class App extends Component {
	constructor(props) {
		super(props);
		let user_session_data = JSON.parse(
			localStorage.getItem("user_session")
		);

		if (localStorage.getItem("user_session")) {
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
	}

	login = response => {
		// console.log(response);

		this.setState({
			user_session: {
				isAuthenticated: true,
				expires_in: response.result.data.expires_in,
				access_token: response.result.data.access_token,
				refresh_token: response.result.data.refresh_token,
				update_time: Math.floor(Date.now() / 1000)
			}
		});
		localStorage.setItem(
			"user_session",
			JSON.stringify(this.state.user_session)
		);
	};

	logout = () => {
		localStorage.removeItem("user_session");
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

	componentDidMount() {
		if (this.state.user_session.isAuthenticated) {
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
					},
					error => {
						console.log(error.message);
						if (error.message == 401) {
							this.logout();
						}
					}
				);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (
			this.state.user_session.isAuthenticated &&
			!prevState.user_session.isAuthenticated
		) {
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
					},
					error => {
						console.log(error.message);
						if (error.message == 401) {
							this.logout();
						}
					}
				);
		}
	}

	render() {
		return (
			<div className="App">
				<Navbar
					isAuthenticated={this.state.user_session.isAuthenticated}
					username={this.state.user_name}
					login={this.login}
					logout={this.logout}
				>
					{" "}
				</Navbar>{" "}
				<Router
					isAuthenticated={this.state.user_session.isAuthenticated}
					user_session={this.state.user_session}
					logout={this.logout}
				>
					{" "}
				</Router>{" "}
				<Footer></Footer>
			</div>
		);
	}
}
