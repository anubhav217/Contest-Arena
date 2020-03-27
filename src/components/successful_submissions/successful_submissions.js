import React, { Component } from "react";

import "./successful_submissions.css";
import { Link } from "react-router-dom";

export default class SuccessfulSubmissions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isWaiting: false,
			submissions: []
		};
	}

	fetchData = () => {
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
					console.log(result);
					this.setState({
						isWaiting: false,
						submissions: result.result.data.content
					});
				},
				error => {
					console.log(error.message);
					if (error.message == 401) {
						this.props.logout();
					}
				}
			);
	};

	componentDidMount() {
		this.fetchData();
	}

	render() {
		let contents = null;

		if (this.state.isWaiting) {
			contents = (
				<div className="text-center mt-4">
					<img src={require("../../imgs/spi.svg")}></img>
				</div>
			);
		} else {
			if (this.state.submissions.length > 0) {
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
