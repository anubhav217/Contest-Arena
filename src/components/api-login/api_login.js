import React, { Component } from "react";

export default class APILogin extends Component {
	constructor(props) {
		super(props);
	}

	getParameter(paramName) {
		let searchString = window.location.search.substring(1),
			i,
			val,
			params = searchString.split("&");

		for (i = 0; i < params.length; i++) {
			val = params[i].split("=");
			if (val[0] == paramName) {
				return val[1];
			}
		}
		return null;
	}

	componentDidMount() {
		if (
			window.location.search.includes("access_token") &&
			window.location.search.includes("refresh_token")
		) {
			// alert(this.getParameter("access_token"));
			this.props.onSuccess({
				access_token: this.getParameter("access_token"),
				refresh_token: this.getParameter("refresh_token")
			});
		} else if (window.location.search.includes("error")) {
			this.props.onFailure(new Error(this.getParameter("error")));
		}
	}

	render() {
		return (
			<div>
				<a href="https://13.232.146.140/login" className="loginbtn">
					Login With CodeChef
				</a>
			</div>
		);
	}
}
