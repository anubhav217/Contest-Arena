import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import MarkdownRenderer from "./markdown";

import "./problem_statement.css";

/**
 * A stateful component responsible rendering the problem details like the title, author, time limit, body, etc.
 */
export default withRouter(
	class ProblemStatement extends Component {
		/**
		 * The first method to be called on instantiating the component. Responsible for initializing the various states of the component
		 * problem_info : Contains all the details of the problem
		 * contest_code : The contest code for the problem
		 * problem_code : The problem code for the problem
		 * fullscreen : Keeps track whether the problem details section is in full screen mode or not.
		 *
		 * @param {Object} props Arguements that are passed as attributes to the component
		 */
		constructor(props) {
			super(props);
			this.problem_info = {};
			this.state = {
				contest_code: this.props.contest_code,
				problem_code: this.props.problem_code,
				fullscreen: this.props.fullscreen
			};
		}

		/**
		 * Fetch the data from codechef api about the details of the problem using the problem code and contest code if they are set.
		 *
		 * @param {boolean} firstTime Used to check whether the request is made for the first time. If at fitst a 401 is thrown due to access token expiry, the token is refreshed and a second request is made.
		 */
		fetchProblemData = firstTime => {
			if (
				this.state.contest_code != "" &&
				this.state.problem_code != ""
			) {
				fetch(
					`${process.env.REACT_APP_SECRET_NAME}/problem/${this.state.contest_code}/${this.state.problem_code}`,
					{
						method: "GET",
						headers: {
							Accept: "application/json",
							Authorization: this.props.user_session.access_token
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
							if (
								result.result.status == "Ok" &&
								result.result.body
							) {
								//If result status is ok, extract and store data in the problem_details list.
								this.problem_info = result.result.body[0];
								this.props.setStatus("ok");
							} else {
								//If status is not okay

								if (result.result.body == 401 && firstTime) {
									this.props.refresh_token();
									this.fetchProblemData(!firstTime);
								}
								this.setState({
									contest_code: "",
									problem_code: ""
								});
								this.props.setStatus("404");
							}
						},
						error => {
							if (error.message == 401 && firstTime) {
								this.props.refresh_token();
								this.fetchProblemData(!firstTime);
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

		/**
		 * Called when component is successfully mounted; tries to fetch the problem details.
		 */
		componentDidMount() {
			this.fetchProblemData(true);
		}

		/**
		 * Called when the component is updated. Used here to fetch the new problem data and set the correct fullscreen mode.
		 *
		 * @param {Object} prevProps Previous instance of the props passed
		 * @param {Object} prevState Previous instance of the component state
		 */
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

		/**
		 * Rendex the JSX.
		 */
		render() {
			let str = this.problem_info.body;

			//Sanitizing the problem body string for proper markdown.
			if (str) {
				str = str.replace(/`/g, "");
				str = str.replace(/###/g, "");
			}

			//Set the correct fullscreen toggle icon
			/****************************************************/
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
			/****************************************************/

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
