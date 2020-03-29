import React, { Component, useState } from "react";

import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ProblemStatement from "../problem_statement/problem_statement";
import Error404 from "../error404/error404";
import Editor from "../editor/editor";
import SuccessfulSubmissions from "../successful_submissions/successful_submissions";

import "./problem_details.css";

/**
 * A stateful component that boostraps various other components related to the problem page, like the submissions, problem statement, editor, etc.
 */
export default class ProblemDetails extends Component {
	/**
	 * The first method called on instantiating the component. Responsible for various initializations.
	 *
	 * problem_code : The problem code passed in the url
	 * contest_code : The contest code passed in the url
	 * status : Determines whether the pair of problem code and contest code is ok (else 404).
	 * p_fullscreen : Keeps tack of the whether the problem statement section is in full screen mode.
	 * c_fullscreen : Keeps tack of the whether the editor section is in full screen mode.
	 *
	 * @param {Object} props Arguments passed to the component as props
	 */
	constructor(props) {
		super(props);
		this.state = {
			problem_code: this.props.match.params.id,
			contest_code: this.props.match.params.contest_code,
			status: "",
			p_fullscreen: false,
			c_fullscreen: false
		};
	}

	/**
	 * Toggles the full screen mode for the problem section
	 */
	handlePFullscreen = () => {
		this.setState(prevState => ({
			p_fullscreen: !prevState.p_fullscreen
		}));
	};

	/**
	 * Toggles the full screen mode for the code editor section
	 */
	handleCFullscreen = () => {
		this.setState(prevState => ({
			c_fullscreen: !prevState.c_fullscreen
		}));
	};

	/**
	 * Sets the status of the problem code and contest code pair (available or not)
	 *
	 * @param {string} code The status code passed
	 */
	setStatus = code => {
		this.setState({
			status: code
		});
	};

	/**
	 * Tabbed panel component; from react-bootstrap.
	 * The individual tabs are problem statement and successful submissions section
	 */
	ControlledTabs = () => {
		const [key, setKey] = useState("home");

		return (
			<Tabs
				id="controlled-tab-example"
				activeKey={key}
				onSelect={k => setKey(k)}
			>
				<Tab eventKey="home" title="Problem Description">
					<ProblemStatement
						contest_code={this.state.contest_code}
						problem_code={this.state.problem_code}
						user_session={this.props.user_session}
						logout={this.props.logout}
						refresh_token={this.props.refresh_token}
						setStatus={code => this.setStatus(code)}
						fullscreen={this.state.p_fullscreen}
						toggleScreen={this.handlePFullscreen}
					></ProblemStatement>
				</Tab>
				<Tab eventKey="profile" title="Successful Submissions">
					<SuccessfulSubmissions
						contest_code={this.state.contest_code}
						problem_code={this.state.problem_code}
						user_session={this.props.user_session}
						logout={this.props.logout}
						refresh_token={this.props.refresh_token}
						fullscreen={this.state.p_fullscreen}
						toggleScreen={this.handlePFullscreen}
					></SuccessfulSubmissions>
				</Tab>
			</Tabs>
		);
	};

	/**
	 * JSX to be rendered.
	 */
	render() {
		let contents = null;

		if (!this.state.p_fullscreen && !this.state.c_fullscreen) {
			contents = (
				<div className="problem-details-container">
					<div className="row">
						<div className="col-xl-6">
							<this.ControlledTabs></this.ControlledTabs>
						</div>
						<div className="col-xl-6">
							<Editor
								user_session={this.props.user_session}
								logout={this.props.logout}
								refresh_token={this.props.refresh_token}
								problem_code={this.state.problem_code}
								contest_code={this.state.contest_code}
								username={this.props.username}
								fullscreen={this.state.c_fullscreen}
								toggleScreen={this.handleCFullscreen}
							></Editor>
						</div>
					</div>
				</div>
			);
		} else if (this.state.p_fullscreen) {
			contents = (
				<div className="problem-details-container">
					<this.ControlledTabs></this.ControlledTabs>
				</div>
			);
		} else if (this.state.c_fullscreen) {
			contents = (
				<div className="problem-details-container">
					<Editor
						user_session={this.props.user_session}
						logout={this.props.logout}
						refresh_token={this.props.refresh_token}
						problem_code={this.state.problem_code}
						contest_code={this.state.contest_code}
						username={this.props.username}
						fullscreen={this.state.c_fullscreen}
						toggleScreen={this.handleCFullscreen}
					></Editor>
				</div>
			);
		}

		if (this.state.status == "404") {
			contents = <Error404></Error404>;
		}

		return contents;
	}
}
