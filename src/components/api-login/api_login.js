import React, { Component } from "react";

export default class APILogin extends Component {
	constructor(props) {
		super(props);
	}

	handleClick = () => {
		fetch("http://api.contest-arena/login", {
			method: "GET",
			headers: {
				Accept: "application/json"
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
					console.log(result);
				},
				error => {
					console.log(error.message);
				}
			);
	};

	render() {
		return (
			<div>
				<button className="loginbtn" onClick={this.handleClick}>
					Login With CodeChef
				</button>
			</div>
		);
	}
}
