import React, { Component } from "react";
import "./contest.css";

import Problems from "../problems/problems";
import Countdown from "react-countdown";
import Rankings from "../rankings/rankings";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";

export default class Contest extends Component {
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

	setRankListCode = code => {
		this.setState({
			rank_list_code: code
		});
	};

	getResults = event => {
		const q = event.target.value;
		let suggestions = [];
		if (q.length > 0) {
			const regx = new RegExp(`^${q}`, "i");
			suggestions = this.contest_list.filter(
				item => regx.test(item.code) || regx.test(item.name)
			);
			// console.log(suggestions.slice(0, 5));
		}
		this.setState({
			query: q,
			suggestions: suggestions.slice(0, 5)
		});
	};

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

	onContestSelect = (code, name, now, start, end) => {
		// console.log("HERE !!!");
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

	ContestStart = () => {
		return (
			<Countdown date={Date.now() + (this.state.end - Date.now())}>
				<this.ContestEnd />
			</Countdown>
		);
	};

	ContestEnd = () => <div className="timer-text">The contest has ended</div>;

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

	componentDidMount() {
		// console.log(this.props.user_session);
		fetch(
			"https://api.codechef.com/contests?fields=code,name,startDate,endDate",
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
					// console.log(result.result.data.content.contestList);
					this.contest_list = result.result.data.content.contestList;
				},
				error => {
					console.log(error.message);
					if (error.message == 401) {
						this.props.refresh_token();
					}
				}
			);
	}
	render() {
		let search_results = null;
		// console.log(this.state.suggestions);
		search_results = this.state.suggestions.map(item => {
			const now = Date.now();
			const start = Date.parse(item.startDate);
			const end = Date.parse(item.endDate);
			// console.log(now, start, end);
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
					{item.name}
					{pill}
				</li>
			);
		});
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
