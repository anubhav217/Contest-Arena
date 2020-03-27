import React, { Component } from "react";

import MarkdownRenderer from "./markdown";
import "./problem_statement.css";

export default class ProblemStatement extends Component {
	constructor(props) {
		super(props);
		this.problem_info = {};
		this.state = {
			contest_code: this.props.contest_code,
			problem_code: this.props.problem_code
		};
		console.log("HERE!!!");
	}

	fetchProblemData = () => {
		if (this.state.contest_code != "" && this.state.problem_code != "") {
			fetch(
				`https://api.codechef.com/contests/${this.state.contest_code}/problems/${this.state.problem_code}?fields=author,problemName,dateAdded,maxTimeLimit,body,tags`,
				{
					method: "GET",
					headers: {
						Accept: "application/json",
						Authorization:
							"Bearer " + this.props.user_session.access_token
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
				.then(
					result => {
						// console.log(result.result.data.content);
						this.problem_info = result.result.data.content;
						this.props.setStatus("ok");
					},
					error => {
						console.log(error.message);
						if (error.message == 401) {
							this.props.logout();
						} else if (error.message == 404) {
							this.setState({
								contest_code: "",
								problem_code: ""
							});

							this.props.setStatus("404");
						}
					}
				);
		}
	};

	componentDidMount() {
		this.fetchProblemData();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.contest_code != prevProps.contest_code) {
			this.fetchProblemData();
		}
	}

	render() {
		let str = this.problem_info.body;
		if (str) {
			str = str.replace(/`/g, "");
			str = str.replace(/###/g, "");
		}
		// console.log(str);
		return (
			<div className="problem-statement-container custom-scroll">
				<MarkdownRenderer source={str}></MarkdownRenderer>
			</div>
		);
	}
}
