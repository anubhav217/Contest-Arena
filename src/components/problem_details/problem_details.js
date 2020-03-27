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
			status: ""
		};
	}

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
						setStatus={code => this.setStatus(code)}
					></ProblemStatement>
				</Tab>
				<Tab eventKey="profile" title="Successful Submissions">
					<SuccessfulSubmissions
						contest_code={this.state.contest_code}
						problem_code={this.state.problem_code}
						user_session={this.props.user_session}
						logout={this.props.logout}
					></SuccessfulSubmissions>
				</Tab>
			</Tabs>
		);
	};
	render() {
		let contents = (
			<div className="problem-details-container">
				<div className="row">
					<div className="col-md-6">
						<this.ControlledTabs></this.ControlledTabs>
					</div>
					<div className="col-md-6">
						<Editor
							user_session={this.props.user_session}
							logout={this.props.logout}
						></Editor>
					</div>
				</div>
			</div>
		);

		if (this.state.status == "404") {
			contents = <Error404></Error404>;
		}

		return contents;
	}
}
