import React, { Component, useState } from "react";

import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ProblemStatement from "../problem_statement/problem_statement";
import Error404 from "../error404/error404";
import Editor from "../editor/editor";
import SuccessfulSubmissions from "../successful_submissions/successful_submissions";

import "./problem_details.css";

export default class ProblemDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			problem_code: this.props.match.params.id,
			contest_code: this.props.match.params.contest_code,
			status: "",
			p_fullscreen: false,
			c_fullscreen: false
		};
		// this.fetchPreviousCode();
	}

	handlePFullscreen = () => {
		this.setState(prevState => ({
			p_fullscreen: !prevState.p_fullscreen
		}));
	};

	handleCFullscreen = () => {
		this.setState(prevState => ({
			c_fullscreen: !prevState.c_fullscreen
		}));
	};

	fetchPreviousCode = () => {
		fetch(
			`http://api.contest-arena/code/${this.state.contest_code}/${this.state.problem_code}/${this.props.username}`,
			{
				method: "GET",
				headers: {
					Accept: "application/json"
				}
			}
		)
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error(res.status);
				}
			})
			.then(result => {
				// console.log(result.result.body);
				if (result.result.body) {
					this.setState({
						previousCode: result.result.body
					});
				}
			})
			.catch(error => console.log("error", error));
	};

	setStatus = code => {
		this.setState({
			status: code
		});
	};

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

	/*componentDidUpdate(prevProps, prevState) {
		if (prevProps.username != this.props.username) {
			// console.log("KUIOO");
			this.fetchPreviousCode();
		}
	}*/

	render() {
		let contents = null;

		if (!this.state.p_fullscreen && !this.state.c_fullscreen) {
			contents = (
				<div className="problem-details-container">
					<div className="row">
						<div className="col-md-6">
							<this.ControlledTabs></this.ControlledTabs>
						</div>
						<div className="col-md-6">
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
