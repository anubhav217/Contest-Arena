import React, { Component } from "react";

import CodechefLogin from "react-codechef-login";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, withRouter } from "react-router-dom";
// import APILogin from "../api-login/api_login";

//Import styles
import "./style.css";

class AppNavbar extends Component {
	responseCodechef = response => {
		this.props.login(response);
		this.props.history.push("/contest");
	};

	loginFailure = response => {
		alert("Some error occured. Try again.");
		this.props.history.push("/");
	};

	render() {
		let navBarRightContent = (
			<CodechefLogin
				clientId="c05ec8e1ed3b1e305a62308a140bb50b"
				clientSecret="8990a3aeae4b9746f3ec00ffc2930780"
				redirectUri="http://localhost:3000"
				state="xyzabc"
				className="loginbtn"
				buttonText="Login With CodeChef"
				onSuccess={this.responseCodechef}
				onFailure={this.loginFailure}
			/>
		);

		if (this.props.isAuthenticated) {
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
