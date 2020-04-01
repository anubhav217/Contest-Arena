import React, { Component } from "react";

import "./successful_submissions.css";

/**
 * Component containing the list of successful submissions information.
 */
export default class SuccessfulSubmissions extends Component {
	/**
	 * The first method to be called on instantiating the component. Responsible for initializing the various states of the component.
	 * submissions: The list of successful submissions data
	 * isWaiting: Tracks if component is in waiting state or not
	 *
	 * @param {Object} props Arguments passed as attributes to the component
	 */
	constructor(props) {
		super(props);
		this.state = {
			isWaiting: false,
			submissions: []
		};
	}

	/**
	 * Fetch the successful submissions data from codechef API.
	 *
	 * @param {boolean} firstTime Used to check whether the request is made for the first time. If at first a 401 is thrown due to access token expiry, the token is refreshed and a second request is made.
	 */
	fetchData = firstTime => {
		this.setState({
			isWaiting: true
		});

		fetch(
			`https://api.codechef.com/submissions/?result=AC&problemCode=${this.props.problem_code}&contestCode=${this.props.contest_code}&fields=id,date,username,language&limit=20`,
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
						isWaiting: false,
						submissions: result.result.data.content
					});
				},
				error => {
					if (error.message == 401 && firstTime) {
						this.props.refresh_token();
						this.fetchData(!firstTime);
					}
				}
			);
	};

	/**
	 * Method called when component is successfully mounted
	 */
	componentDidMount() {
		this.fetchData();
	}

	/**
	 * Render JSX
	 */
	render() {
		let contents = null;

		if (this.state.isWaiting) {
			contents = (
				<div className="text-center mt-4">
					<img src={require("../../imgs/spi.svg")}></img>
				</div>
			);
		} else {
			if (this.state.submissions && this.state.submissions.length > 0) {
				contents = (
					<div className="succ-sub-container custom-scroll">
						<table className="table table-striped">
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Submissions ID</th>
									<th scope="col">Date</th>
									<th scope="col">UserID</th>
									<th scope="col">Language</th>
								</tr>
							</thead>
							<tbody>
								{this.state.submissions.map((item, index) => {
									return (
										<tr key={item.id}>
											<th scope="row">{index + 1}</th>
											<td>
												<a
													href={
														"https://www.codechef.com/viewsolution/" +
														item.id
													}
													target="_blank"
													className="sub-link"
												>
													{item.id}
												</a>
											</td>
											<td>{item.date}</td>
											<td>{item.username}</td>
											<td>{item.language}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				);
			} else {
				contents = (
					<div className="alert alert-info mt-5 w-75 mx-auto">
						No successful submissions made yet!
					</div>
				);
			}
		}

		return contents;
	}
}
