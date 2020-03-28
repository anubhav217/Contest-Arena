import React, { Component } from "react";

import "./App.css";
import Navbar from "./components/navbar/navbar";
import Router from "./components/router/router";
import Footer from "./components/footer/footer";
import Cookie from 'react-cookies';
// import { useCookies } from 'react-cookie';

export default class App extends Component {
	constructor(props) {
		super(props);
		// console.log(Cookie.load("user_session"));
		
		/*let user_session_data = JSON.parse(
			localStorage.getItem("user_session")
			// Cookie.load("user_session")
		);*/

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
	}

	refresh_token = () => {
		console.log(this.state.user_session.refresh_token);
		
		fetch(
			"https://api.codechef.com/oauth/token",
			{
				method: "POST",
				headers: {
					"content-Type": "application/json"
				},
				body: JSON.stringify({
					grant_type : "refresh_token",
					refresh_token : this.state.user_session.refresh_token,
					client_id : "c05ec8e1ed3b1e305a62308a140bb50b",
					client_secret : "8990a3aeae4b9746f3ec00ffc2930780"
				})
			}
		)
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error(res.status);
				}
			})
			.then(
				result => {
					console.log(result);
					
					// console.log(result.result.data.content.contestList);
					this.setState({
						user_session:{
							isAuthenticated: true,
						expires_in: result.result.data.expires_in,
						access_token: result.result.data.access_token,
						refresh_token: result.result.data.refresh_token,
						update_time: Date.now()
						}
					});

					Cookie.save('user_session', this.state.user_session, {path: '/', maxAge: 604800, expires: new Date(Date.now()+604800000)});
				},
				error => {
					console.log(error.message);
					this.logout();
				}
			);
			
	}

	login = response => {
		// console.log(response);

		this.setState({
			user_session: {
				isAuthenticated: true,
				expires_in: response.result.data.expires_in,
				access_token: response.result.data.access_token,
				refresh_token: response.result.data.refresh_token,
				update_time: Date.now()
			}
		});
		Cookie.save('user_session', this.state.user_session, {path: '/', maxAge: 604800, expires: new Date(Date.now()+604800000)});
		/*localStorage.setItem(
			"user_session",
			JSON.stringify(this.state.user_session)
		);*/
		
	};

	logout = () => {
		//localStorage.removeItem("user_session");
		Cookie.remove('user_session', { path: '/' });
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
							this.refresh_token();
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
					refresh_token={this.refresh_token}
				>
					{" "}
				</Router>{" "}
				<Footer></Footer>
			</div>
		);
	}
}
