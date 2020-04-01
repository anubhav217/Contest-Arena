import React, { Component } from "react";
import "./contest.css";

import Problems from "../problems/problems";
import Countdown from "react-countdown";
import Rankings from "../rankings/rankings";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Cookie from "react-cookies";
import { useState } from "react";

/**
 * This Component contains the search bar, problems, recent submissions and rankings.
 * This is a stateful component.
 */

export default class Contest extends Component {
	/**
	 * First method called on instantiating the component.
	 * Initializes the list of contests available from the Codechef API.
	 * The states are initialized for search suggestions, query, contest code selected,
	 * rank list code and whether to show the search results or not
	 *
	 * @param {Object} props Arguments that are passed to the component
	 */
	constructor(props) {
		super(props);
		this.contest_list = [];
		this.state = {
			suggestions: [],
			query: "",
			contest_code: "",
			rank_list_code: "",
			show_results: true
		};
	}

	/**
	 * Sets the contest code whose ranklist is to be seen.
	 *
	 * @param {string} code The contest code whose ranklist is to be seen
	 */
	setRankListCode = code => {
		this.setState({
			rank_list_code: code
		});
	};

	/**
	 * Get the search results from the contest list, based on the query.
	 *
	 * @param {Object} event The event object related to the DOM Element on which the event was triggered
	 */
	getResults = event => {
		const q = event.target.value;
		let trimmed_query = q.trim();
		let suggestions = [];
		if (trimmed_query.length > 0) {
			suggestions = this.contest_list.filter(item => {
				let c1 = item.code.toLowerCase();
				let c2 = item.name.toLowerCase();
				let search_query = q.toLowerCase();
				search_query = search_query.trim();
				return (
					c1.indexOf(search_query) > -1 ||
					c2.indexOf(search_query) > -1
				);
			});
		}
		this.setState({
			query: q,
			suggestions: suggestions.slice(0, 5)
		});
	};

	/**
	 * Ranklist modal containing the ranklist table. It's a functional component.
	 */
	Ranklist = () => {
		const [lgShow, setLgShow] = useState(false);

		return (
			<div>
				<Button onClick={() => setLgShow(true)}>View Ranklist</Button>
				<Modal
					size="lg"
					show={lgShow}
					onHide={() => setLgShow(false)}
					aria-labelledby="Ranklist"
					dialogClassName="custom-modal"
				>
					<Modal.Header closeButton>
						<Modal.Title id="example-modal-sizes-title-lg">
							Ranklist
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Rankings
							contestCode={this.state.rank_list_code}
							user_session={this.props.user_session}
							logout={this.props.logout}
							refresh_token={this.props.refresh_token}
						></Rankings>
					</Modal.Body>
				</Modal>
			</div>
		);
	};

	/**
	 * Modifies the state of the contest component, when a contest is selected from the
	 * search results.
	 *
	 * @param {string} code The code of the selected contest
	 * @param {string} name The name of the selected contest
	 * @param {Timestamp} now The current timestamp
	 * @param {Timestamp} start The timestamp when the contest started
	 * @param {Timestamp} end The timestamp when the contest ended
	 */
	onContestSelect = (code, name, now, start, end) => {
		let started = true;
		if (start > now) {
			started = false;
		}
		this.setState({
			suggestions: [],
			query: name,
			contest_code: code,
			start: start,
			end: end,
			started: started
		});
	};

	/**
	 * Modifies the timer component based on contest start time
	 */
	ContestStart = () => {
		return (
			<Countdown date={Date.now() + (this.state.end - Date.now())}>
				<this.ContestEnd />
			</Countdown>
		);
	};

	/**
	 * Modifies the timer component based on contest end time
	 */
	ContestEnd = () => <div className="timer-text">The contest has ended</div>;

	/**
	 * Reset the search bar and search results
	 *
	 * @param {boolean} keepSearchQuery Option to keep the search query in the search bar
	 */
	resetSearch = (keepSearchQuery = false) => {
		if (keepSearchQuery) {
			this.setState({
				suggestions: [],
				contest_code: ""
			});
		} else {
			this.setState({
				suggestions: [],
				query: "",
				contest_code: ""
			});
		}
	};

	/**
	 * Fetches the lists of contests from codechef API. The data is cached in my backend server database, to ensure minimal calls to codechef API.
	 *
	 * @param {boolean} firstTime Used to check whether the request is made for the first time. If at fitst a 401 is thrown due to access token expiry, the token is refreshed and a second request is made.
	 */
	fetchContestListData = firstTime => {
		let user_session_data = Cookie.load("user_session");
		console.log("HEREEEE");
		if (user_session_data) {
			fetch(
				"https://api.codechef.com/contests?fields=code,name,startDate,endDate",
				{
					method: "GET",
					headers: {
						Accept: "application/json",
						Authorization:
							"Bearer " + user_session_data.access_token
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
						this.contest_list =
							result.result.data.content.contestList;
					},
					error => {
						if (error.message == 401 && firstTime) {
							this.props.refresh_token();
							this.fetchContestListData(!firstTime);
						} else {
							console.log(error.message);
						}
					}
				);
		}
	};

	/**
	 * Called when the component is mounted successfully.
	 * The list of available contests is fetched from the codechef API here.
	 */
	componentDidMount() {
		this.fetchContestListData(true);
	}

	/**
	 * Responsible for rendering the component and it's children.
	 */
	render() {
		//Set the sear results
		let search_results = null;
		search_results = this.state.suggestions.map(item => {
			const now = Date.now();
			const start = Date.parse(item.startDate);
			const end = Date.parse(item.endDate);

			//Setting the tag (past, present or upcoming contest)
			let pill = null;

			if (now < start) {
				pill = (
					<span className="badge badge-primary badge-pill">
						UPCOMING
					</span>
				);
			} else if (now <= end) {
				pill = (
					<span className="badge badge-success badge-pill">LIVE</span>
				);
			} else {
				pill = (
					<span className="badge badge-danger badge-pill">PAST</span>
				);
			}
			return (
				<li
					onClick={() =>
						this.onContestSelect(
							item.code,
							item.name,
							now,
							start,
							end
						)
					}
					key={item.code}
					className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
				>
					{item.name + " [" + item.code + "]"}
					{pill}
				</li>
			);
		});

		//Set the timer according to the contest timings
		let timer = null;
		if (this.state.contest_code != "") {
			if (Date.now() < this.state.start) {
				timer = (
					<div>
						<div className="timer-text">Contest starts in</div>
						<div className="timer-container">
							<Countdown
								date={
									Date.now() + (this.state.start - Date.now())
								}
							>
								<this.ContestStart />
							</Countdown>
						</div>
					</div>
				);
			} else {
				timer = (
					<div>
						<div className="timer-container">
							<Countdown
								date={
									Date.now() + (this.state.end - Date.now())
								}
							>
								<this.ContestEnd />
							</Countdown>
						</div>
					</div>
				);
			}
		}
		return (
			<div className="section-container">
				<div className="search-section">
					<div className="container mb-4">
						<img
							src={require("../../imgs/codechef.png")}
							alt="Codechef logo"
						></img>
						<img
							src={require("../../imgs/plus.png")}
							style={{ width: "4%" }}
							alt="Plus logo"
						></img>
						<img
							alt="Coffee image"
							src={require("../../imgs/code-coffee.png")}
						></img>
					</div>
					<div className="container search-box">
						<input
							type="text"
							className="form-control mx-auto"
							placeholder="Enter contest name or code..."
							value={this.state.query}
							onChange={this.getResults}
							onBlur={() => {
								setTimeout(() => {
									//Setting a time delay, since a click on search result and this blur event happen simultaneously
									this.setState({ show_results: false });
								}, 200);
							}}
							onFocus={() => {
								this.setState({ show_results: true });
							}}
						></input>
						<ul
							className="search-result list-group"
							style={{
								display: this.state.show_results
									? "block"
									: "none"
							}}
						>
							{search_results}
						</ul>
					</div>
				</div>
				<div className="mt-5">
					<div className="container">
						<div className="row">
							<div className="col-md-6">
								<div className="timer-container">{timer}</div>
							</div>
							<div className="col-md-6">
								<div className="rank-btn-container">
									<this.Ranklist />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="mt-5">
					<Problems
						user_session={this.props.user_session}
						logout={this.props.logout}
						refresh_token={this.props.refresh_token}
						setRankListCode={this.setRankListCode}
						contest_code={this.state.contest_code}
						resetSearch={this.resetSearch}
					></Problems>
				</div>
			</div>
		);
	}
}
