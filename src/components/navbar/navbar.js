import React, { Component } from "react";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, withRouter } from "react-router-dom";
import APILogin from "../api-login/api_login";
import Cookie from "react-cookies";

import "./style.css";

/**
 * A stateful component containing the Navbar
 */
class AppNavbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			logged_in: false
		};
	}
	//Callback function when there's a successful OAuth login by codechef
	responseCodechef = response => {
		this.props.login(response);
	};

	//Callback function on login failure
	loginFailure = response => {
		alert("Some error occured. Try again.");
		this.props.history.push("/");
	};

	componentDidMount() {
		// let user_session_data = Cookie.load("user_session");
		// if (user_session_data && user_session_data.isAuthenticated) {
		this.setState({
			logged_in: this.props.isAuthenticated
		});
		// }
		// else {
		// 	this.setState({
		// 		logged_in: false
		// 	});
		// }
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.isAuthenticated != this.props.isAuthenticated) {
			this.setState({
				logged_in: this.props.isAuthenticated
			});
		}
	}

	//JSX to be rendered
	render() {
		let user_session_data = Cookie.load("user_session");

		let navBarRightContent = (
			<APILogin
				className="loginbtn"
				onSuccess={this.responseCodechef}
				onFailure={this.loginFailure}
			/>
		);

		if (this.state.logged_in) {
			navBarRightContent = (
				<NavDropdown
					title={"Hello, " + this.props.username}
					className="nav-drop-fix dropdown-menu-right"
					id="collasible-nav-dropdown"
				>
					<NavDropdown.Item
						// className="btn"
						onClick={this.props.logout}
					>
						Log out
					</NavDropdown.Item>
				</NavDropdown>
			);
		}
		return (
			<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
				<Navbar.Brand as={Link} to="/">
					<img
						alt=""
						src={require("../../imgs/logo.svg")}
						width="30"
						height="30"
						className="d-inline-block align-top"
					/>{" "}
					Contest Arena
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="responsive-navbar-nav" />
				<Navbar.Collapse id="responsive-navbar-nav">
					<Nav className="mr-auto">
						<Nav.Link as={Link} to="/contest">
							Contest
						</Nav.Link>
					</Nav>
					<Nav>{navBarRightContent}</Nav>
				</Navbar.Collapse>
			</Navbar>
		);
	}
}

export default withRouter(AppNavbar);
