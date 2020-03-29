import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import MarkdownRenderer from "./markdown";
import "./problem_statement.css";

export default withRouter(
	class ProblemStatement extends Component {
		constructor(props) {
			super(props);
			this.problem_info = {};
			this.state = {
				contest_code: this.props.contest_code,
				problem_code: this.props.problem_code,
				fullscreen: this.props.fullscreen
			};
			// console.log("HERE!!!");
		}

		fetchProblemData = () => {
			if (
				this.state.contest_code != "" &&
				this.state.problem_code != ""
			) {
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
								this.props.refresh_token(
									this.props.location.pathname
								);
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
			if (
				this.props.contest_code != prevProps.contest_code ||
				this.props.problem_code != prevProps.problem_code
			) {
				this.fetchProblemData();
			}
			if (this.props.fullscreen != prevProps.fullscreen) {
				this.setState({
					fullscreen: this.props.fullscreen
				});
			}
		}

		render() {
			let str = this.problem_info.body;
			if (str) {
				str = str.replace(/`/g, "");
				str = str.replace(/###/g, "");
			}
			// console.log(str);
			let full_screen_icon = (
				<div
					className="tab-f-icon-container"
					onClick={this.props.toggleScreen}
				>
					<i className="tab-fscreen-icon fas fa-compress"></i>
				</div>
			);

			if (!this.props.fullscreen) {
				full_screen_icon = (
					<div
						className="tab-f-icon-container"
						onClick={this.props.toggleScreen}
					>
						<i className="tab-fscreen-icon fas fa-expand"></i>
					</div>
				);
			}
			return (
				<div>
					<div className="text-right">{full_screen_icon}</div>
					<div className="problem-statement-container custom-scroll">
						<div className="container text-center">
							<div className="problem-title container">
								{this.problem_info.problemName}
							</div>
							<div className="container auth-time">
								<div className="row">
									<div className="col-md-6 text-center">
										Author :{" "}
										<a
											href={
												"https://www.codechef.com/users/" +
												this.problem_info.author
											}
											target="_blank"
											className="user-link"
										>
											{this.problem_info.author}
										</a>
									</div>
									<div className="col-md-6 text-center">
										Time Limit:{" "}
										{this.problem_info.maxTimeLimit}s
									</div>
								</div>
							</div>
							<hr></hr>
						</div>

						<div>
							<MarkdownRenderer source={str}></MarkdownRenderer>
						</div>
					</div>
				</div>
			);
		}
	}
);
