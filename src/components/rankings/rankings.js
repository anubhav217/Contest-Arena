import React, { Component } from "react";

import ReactCountryFlag from "react-country-flag";
import Pagination from "react-js-pagination";

import "./ranklist.css";

export default class Rankings extends Component {
	constructor(props) {
		super(props);
		this.rankings = [];
		this.state = {
			rankings: [],
			is_waiting: false,
			activePage: 1
		};
		// console.log("In ranklist!!");
	}

	fetchRanklistData = () => {
		this.setState({
			is_waiting: true
		});

		let too_many = false;

		fetch(
			`https://api.codechef.com/rankings/${this.props.contestCode}?fields=rank,username,countryCode,country`,
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
					this.rankings = result.result.data.content;
					this.setState({
						rankings: this.rankings.slice(0, 10),
						is_waiting: false
					});
				},
				error => {
					console.log(error.message);
					if (error.message == 401) {
						this.props.refresh_token();
					}
					if (error.message == 429 && !too_many) {
						alert("Too many requests!");
						too_many = !too_many;
						this.setState({
							rankings: [],
							isWaiting: false
						});
					}
					if (error.message == 404) {
						alert("Page not found! 404 :(");
						this.setState({
							rankings: [],
							isWaiting: false
						});
					}
				}
			);
	};

	handlePageChange = pageNumber => {
		console.log(`active page is ${pageNumber}`);
		this.setState({
			activePage: pageNumber,
			rankings: this.rankings.slice(
				(pageNumber - 1) * 10,
				(pageNumber - 1) * 10 + 10
			)
		});
	};

	componentDidMount() {
		if (this.props.contestCode != "") {
			this.fetchRanklistData();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.contestCode != prevProps.contestCode) {
			this.fetchRanklistData();
		}
	}

	render() {
		let ranklist = (
			<div className="ranklist-title">No rankings to fetch!</div>
		);

		if (this.state.is_waiting) {
			ranklist = <img src={require("../../imgs/spi.svg")}></img>;
		} else if (this.state.rankings.length > 0) {
			ranklist = (
				<table className="table table-hover">
					<thead className="thead-dark">
						<tr>
							<th scope="col">#</th>
							<th scope="col">Rank</th>
							<th scope="col">Username</th>
							<th scope="col">Country</th>
						</tr>
					</thead>
					<tbody>
						{this.state.rankings.map((item, index) => {
							return (
								<tr key={item.username}>
									<th scope="row">
										{(this.state.activePage - 1) * 10 +
											index +
											1}
									</th>
									<td>{item.rank}</td>
									<td>{item.username}</td>
									<td>
										{/* {item.countryCode} */}
										<ReactCountryFlag
											// className="emojiFlag"
											countryCode={item.countryCode}
											svg
											cdnSuffix="svg"
											aria-label={item.country}
											title={item.country}
											cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			);
		}

		let pagination = null;

		if (!this.state.is_waiting && this.state.rankings.length > 0) {
			pagination = (
				<Pagination
					activePage={this.state.activePage}
					itemsCountPerPage={10}
					totalItemsCount={this.rankings.length}
					pageRangeDisplayed={5}
					onChange={this.handlePageChange.bind(this)}
					innerClass="pagination"
					itemClass="page-item"
					activeClass="active"
					activeLinkClass="active"
					linkClass="page-link"
				></Pagination>
			);
		}
		return (
			<div className="ranklist-container">
				{ranklist}
				{pagination}
			</div>
		);
	}
}
