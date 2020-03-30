import React, { Component } from "react";

import "./problems.css";

import { Link } from "react-router-dom";
import Submissions from "../submissions/submissions";

/**
 * Stateful component responsible for displaying the problem list on the contest page.
 */
export default class Problems extends Component {
	/**
	 * The first method to be called on instantiating the component. Responsible for initializing the various states of the component.
	 * problems: The list of problems for the contest
	 * problem_details: The details of every problem of the contest (name, submission info etc.)
	 * isParent: Whether the contest has sub divisions(Div A, Div B)
	 * children: If the contest has divisons, the children stores the contest codes of the sub contests.
	 * curr_category: Tracks the currently selected sub category of a contest (if any).
	 *
	 * @param {Object} props Arguements that are passed as attributes to the component
	 */
	constructor(props) {
		super(props);
		this.state = {
			problems: [],
			problem_details: [],
			isParent: false,
			children: [],
			curr_category: "",
			isWaiting: false
		};
	}

	/**
	 * Fetches the problem details of a selected subcontest from my backend server. Caching is implemented in my backend DB to minimize the number of api calls to codechef.
	 *
	 * @param {string} contest_code The contest code whose problem details is to be fetched.
	 */
	onCategorySet = contest_code => {
		//Set the current waiting state to true
		this.setState({
			isWaiting: true
		});

		//Flag to check if already got error message.
		let too_many = false;
		let error_shown = false;

		fetch("https://api.codechef.com/contests/" + contest_code, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: "Bearer " + this.props.user_session.access_token
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
					//Get the list of problem codes for the contest.
					let problems = result.result.data.content.problemsList;
					let fetches = [];
					let problem_details = [];

					//Loop through each problem and fetch the problem details, against every problem code.
					problems.forEach(item => {
						fetches.push(
							fetch(
								`http://api.contest-arena/problem/${contest_code}/${item.problemCode}`,
								{
									method: "GET",
									headers: {
										Accept: "application/json",
										Authorization: this.props.user_session
											.access_token
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
											//Extract the required fields.
											let obj = {};
											obj["name"] =
												result.result.body[0].problemName;
											obj["successful_submissions"] =
												result.result.body[0].successfulSubmissions;
											obj["problemCode"] =
												item.problemCode;
											obj["contestCode"] = contest_code;

											//Save info in the problem_details state.
											problem_details.push(obj);
										} else if (!error_shown) {
											error_shown = true;
											alert(
												"Oops! Error " +
													result.result.body +
													" occured"
											);
											this.props.resetSearch();
											this.setState({
												problems: [],
												problem_details: [],
												isParent: false,
												children: [],
												curr_category: "",
												isWaiting: false
											});
										}
									},
									error => {
										if (error.message == 401) {
											this.props.refresh_token();
										}
										if (error.message == 429 && !too_many) {
											alert("Too many API requests!");
											too_many = !too_many;
											this.props.resetSearch();
											this.setState({
												problems: [],
												problem_details: [],
												isParent: false,
												children: [],
												curr_category: "",
												isWaiting: false
											});
										}

										this.props.resetSearch();
										this.setState({
											problems: [],
											problem_details: [],
											isParent: false,
											children: [],
											curr_category: "",
											isWaiting: false
										});
									}
								)
						);
					});

					//Execute all the fetch request in async manner.
					return Promise.all(fetches).then(() => {
						return {
							problems: problems,
							problem_details: problem_details
						};
					});
				},
				error => {
					if (error.message == 401) {
						this.props.refresh_token();
					}
					if (error.message == 429 && !too_many) {
						alert("Too many API requests!");
						too_many = !too_many;
						this.props.resetSearch();
						this.setState({
							problems: [],
							problem_details: [],
							isParent: false,
							children: [],
							curr_category: "",
							isWaiting: false
						});
					}
					if (error.message == 404) {
						alert("Page not found! 404 :(");
						this.setState({
							problems: [],
							problem_details: [],
							curr_category: contest_code,
							isWaiting: false
						});
					}
				}
			)
			.then(result => {
				if (result) {
					this.setState({
						problems: result.problems,
						problem_details: result.problem_details,
						curr_category: contest_code,
						isWaiting: false
					});
					this.props.setRankListCode(contest_code);
				}
			});
	};

	/**
	 * Fetches the Contest data on component update.
	 *
	 * @param {Object} prevProps Previous copy of props
	 * @param {Object} prevState Previous copu of state
	 * @param {Object} snapshot Previous value of snapshot
	 */
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (
			prevProps.contest_code != this.props.contest_code &&
			this.props.contest_code != ""
		) {
			//Set the component to show waiting state.
			this.setState({
				isWaiting: true
			});

			//Flag to check if error message already shown.
			let too_many = false;
			let error_show = false;

			//Fetch the details of the contest selected.
			fetch(
				`https://api.codechef.com/contests/${this.props.contest_code}`,
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
						const isParent = result.result.data.content.isParent;
						const children = result.result.data.content.children;
						let problems = [];
						let problem_details = [];
						let fetches = [];
						problems = result.result.data.content.problemsList;

						//If the contest selected does not have any sub contests, fetch the name and number of successful submissions of every problem.
						problems.forEach((item, index) => {
							fetches.push(
								fetch(
									`http://api.contest-arena/problem/${this.props.contest_code}/${item.problemCode}`,
									{
										method: "GET",
										headers: {
											Accept: "application/json",
											Authorization: this.props
												.user_session.access_token
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
												let obj = {};
												obj["name"] =
													result.result.body[0].problemName;
												obj["successful_submissions"] =
													result.result.body[0].successfulSubmissions;
												obj["problemCode"] =
													item.problemCode;
												obj[
													"contestCode"
												] = this.props.contest_code;

												//Store details is problem_details list
												problem_details.push(obj);
											} else {
												//If status is not okay, display an alert.
												alert(
													"Oops! Error " +
														result.result.body +
														" occured"
												);
												this.props.resetSearch();
												this.setState({
													problems: [],
													problem_details: [],
													isParent: false,
													children: [],
													curr_category: "",
													isWaiting: false
												});
											}
										},
										error => {
											//Display other relevant error messages and reset the state
											if (error.message == 401) {
												this.props.refresh_token();
											}
											if (
												error.message == 429 &&
												!too_many
											) {
												alert("Too many requests!");
												too_many = !too_many;
											}
											this.props.resetSearch();
											this.setState({
												problems: [],
												problem_details: [],
												isParent: false,
												children: [],
												curr_category: "",
												isWaiting: false
											});
										}
									)
							);
						});

						//Execute all the fetch requests in async manner.
						return Promise.all(fetches).then(() => {
							return {
								problems: problems,
								isParent: isParent,
								children: children,
								problem_details: problem_details
							};
						});
					},
					error => {
						if (error.message == 401) {
							this.props.refresh_token();
						}
						if (error.message == 429 && !too_many) {
							alert("Too many requests!");
							too_many = !too_many;
							this.props.resetSearch();
							this.setState({
								problems: [],
								problem_details: [],
								isParent: false,
								children: [],
								curr_category: "",
								isWaiting: false
							});
						}
						if (error.message == 404) {
							alert("Page not found! 404 :(");
							this.setState({
								problems: [],
								isParent: false,
								children: [],
								problem_details: [],
								curr_category: "",
								isWaiting: false
							});
						}
					}
				)
				.then(result => {
					//When everything is fetched properly, update the relevant component states.
					if (result) {
						this.setState({
							problems: result.problems,
							isParent: result.isParent,
							children: result.children,
							problem_details: result.problem_details,
							curr_category: "",
							isWaiting: false
						});
						if (!this.state.isParent) {
							this.props.setRankListCode(this.props.contest_code);
						} else {
							this.props.setRankListCode("");
						}
					}
				});
		}
	}

	/**
	 * Render JSX
	 */
	render() {
		let divisions = null;
		if (this.state.isParent) {
			divisions = (
				<div className="mb-4">
					<div className="btn-group">
						<button
							type="button"
							className="btn btn-info dropdown-toggle"
							data-toggle="dropdown"
							aria-haspopup="true"
							aria-expanded="false"
						>
							{this.state.curr_category == ""
								? "Select category"
								: this.state.curr_category}
						</button>
						<div className="dropdown-menu">
							{this.state.children.map(item => (
								<button
									className="dropdown-item"
									href="#"
									onClick={() => this.onCategorySet(item)}
									key={item}
									style={{ cursor: "pointer" }}
								>
									{item}
								</button>
							))}
						</div>
					</div>
				</div>
			);
		}

		let problems = (
			<div className="problems-message">
				Select a contest and appropriate division to view the problems.
			</div>
		);
		if (
			this.state.isWaiting ||
			this.state.problems.length != this.state.problem_details.length
		) {
			problems = <img src={require("../../imgs/spi.svg")}></img>;
		} else if (this.state.problems.length > 0) {
			problems = (
				<div className="problems-container">
					<table className="table table-hover">
						<thead className="thead-dark">
							<tr>
								<th scope="col">#</th>
								<th scope="col">Name</th>
								<th scope="col">Successful submissions</th>
							</tr>
						</thead>
						<tbody>
							{this.state.problem_details.map((item, index) => (
								<tr key={item.problemCode}>
									<th scope="row">{index + 1}</th>
									<td>
										<Link
											to={`/problems/${item.problemCode}/${item.contestCode}`}
											target="_blank"
										>
											{
												this.state.problem_details[
													index
												].name
											}
										</Link>
									</td>
									<td>
										{
											this.state.problem_details[index]
												.successful_submissions
										}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
		return (
			<div className="container contest-container mt-5">
				<div className="row">
					<div className="col-md-6">
						<div className="problem-section">
							{divisions}
							{problems}
						</div>
					</div>
					<div className="col-md-6">
						<Submissions
							user_session={this.props.user_session}
							contest_code={
								this.state.curr_category == ""
									? this.props.contest_code
									: this.state.curr_category
							}
							logout={this.props.logout}
							refresh_token={this.props.refresh_token}
						>
							<img src={require("../../imgs/spi.svg")}></img>
						</Submissions>
					</div>
				</div>
			</div>
		);
	}
}
