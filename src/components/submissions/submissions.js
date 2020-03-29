import React, { Component } from "react";

import "./submissions.css";

/**
 * Stateful component which deals with recent submission information on the contest page
 */
export default class Submissions extends Component {
	/**
	 * The first method to be called on instantiating the component. Responsible for initializing the various states of the component.
	 * submissions: The list of submissions data
	 * isWaiting: Tracks if component is in waiting state or not
	 *
	 * @param {Object} props Arguements that are passed as attributes to the component
	 */
	constructor(props) {
		super(props);
		this.state = {
			is_waiting: false,
			submissions: []
		};
	}

	/**
	 * Fetch the recent submissions data from codechef API
	 *
	 * @param {boolean} firstTime Used to check whether the request is made for the first time. If at fitst a 401 is thrown due to access token expiry, the token is refreshed and a second request is made.
	 */
	getRecentSubmissionData = firstTime => {
		this.setState({
			is_waiting: true
		});

		let too_many = false;

		fetch(
			`https://api.codechef.com/submissions/?contestCode=${this.props.contest_code}&fields=id,username,language,problemCode,result,date`,
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
					this.setState({
						is_waiting: false,
						submissions: result.result.data.content
					});
				},
				error => {
					console.log(error.message);
					if (error.message == 401 && firstTime) {
						this.props.refresh_token();
						this.getRecentSubmissionData(!firstTime);
					}
					if (error.message == 429 && !too_many) {
						alert("Too many API requests!");
						too_many = !too_many;
						this.props.resetSearch();
						this.setState({
							is_waiting: false,
							submissions: []
						});
					}
				}
			);
	};

	/**
	 * Called on component update
	 *
	 * @param {Object} prevProps Previous instance of props
	 * @param {Object} prevState Previous instance of component state
	 */
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.contest_code != this.props.contest_code) {
			this.getRecentSubmissionData(true);
		}
	}

	/**
	 * Refresh the current set of submissions information for the contest
	 */
	onRefresh = () => {
		if (this.props.contest_code != "") this.getRecentSubmissionData(true);
	};

	/**
	 * Render JSX
	 */
	render() {
		let submissions = (
			<div className="text-center">No submissions to fetch</div>
		);

		if (this.state.is_waiting) {
			submissions = <img src={require("../../imgs/spi.svg")}></img>;
		} else if (
			this.state.submissions &&
			this.state.submissions.length > 0
		) {
			submissions = (
				<table className="table table-striped table-responsive">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Date</th>
							<th scope="col">Username</th>
							<th scope="col">Problem</th>
							<th scope="col">Result</th>
						</tr>
					</thead>
					<tbody>
						{this.state.submissions.map((item, index) => {
							let res = null;
							if (item.result == "AC") {
								res = (
									<img
										src={require("../../imgs/ac.gif")}
									></img>
								);
							} else if (item.result == "WA") {
								res = (
									<img
										src={require("../../imgs/wa.gif")}
									></img>
								);
							} else if (item.result == "TLE") {
								res = (
									<img
										src={require("../../imgs/tle.png")}
									></img>
								);
							} else if (item.result == "CTE") {
								res = (
									<img
										src={require("../../imgs/cte.gif")}
									></img>
								);
							} else if (item.result == "RTE") {
								res = (
									<img
										src={require("../../imgs/rte.png")}
									></img>
								);
							}
							return (
								<tr key={item.id}>
									<th scope="row">{index + 1}</th>
									<td>{item.date}</td>
									<td>{item.username}</td>
									<td>{item.problemCode}</td>
									<td>{res}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			);
		}
		return (
			<div className="submissions-container">
				<div className="submissions-title">
					<div className="row">
						<div className="col-md-9 title-text">
							Recent Submissions
						</div>
						<div className="col-md-3 pt-1">
							<i
								className="fas fa-sync-alt refresh-icon"
								onClick={this.onRefresh}
							></i>
						</div>
					</div>
				</div>
				<div className="mt-4">
					<div className="submissions-table-container text-center">
						{submissions}
					</div>
				</div>
			</div>
		);
	}
}
