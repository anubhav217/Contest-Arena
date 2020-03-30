import React, { Component } from "react";

import ReactCountryFlag from "react-country-flag";
import Pagination from "react-js-pagination";

import "./ranklist.css";

/**
 * Fetches the ranklist of the current contest.
 */
export default class Rankings extends Component {
	/**
	 * The first method to be called on instantiating the component. Responsible for initializing the various states of the component.
	 * rankings: The list of rankings data
	 * isWaiting: Tracks if component is in waiting state or not
	 * activePage: Tracks the current page number.
	 *
	 * @param {Object} props Arguements that are passed as attributes to the component
	 */
	constructor(props) {
		super(props);
		this.rankings = [];
		this.state = {
			rankings: [],
			is_waiting: false,
			activePage: 1
		};
	}

	/**
	 * Fetch the ranklist data for the selected contest
	 *
	 * @param {boolean} firstTime Used to check whether the request is made for the first time. If at fitst a 401 is thrown due to access token expiry, the token is refreshed and a second request is made.
	 */
	fetchRanklistData = firstTime => {
		this.setState({
			is_waiting: true
		});

		let too_many = false;

		fetch(
			`https://api.codechef.com/rankings/${this.props.contestCode}?fields=rank,username,countryCode,country,totalScore,institution`,
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
					this.rankings = result.result.data.content;
					this.setState({
						rankings: this.rankings.slice(0, 10),
						is_waiting: false
					});
				},
				error => {
					if (error.message == 401 && firstTime) {
						this.props.refresh_token();
						this.fetchRanklistData(!firstTime);
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

	/**
	 * Event handler for page number change
	 */
	handlePageChange = pageNumber => {
		this.setState({
			activePage: pageNumber,
			rankings: this.rankings.slice(
				(pageNumber - 1) * 10,
				(pageNumber - 1) * 10 + 10
			)
		});
	};

	/**
	 * Called when component is successfully mounted.
	 */
	componentDidMount() {
		if (this.props.contestCode != "") {
			this.fetchRanklistData(true);
		}
	}

	/**
	 * Callen on component update
	 *
	 * @param {Object} prevProps Previous instance of props
	 * @param {Object} prevState Previous instance of component state
	 */
	componentDidUpdate(prevProps, prevState) {
		if (this.props.contestCode != prevProps.contestCode) {
			this.fetchRanklistData(true);
		}
	}

	/**
	 * Render JSX
	 */
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
							<th scope="col">Rank</th>
							<th scope="col">Username</th>
							<th scope="col">Total Score</th>
							<th scope="col">Country</th>
							<th scope="col">Institution</th>
						</tr>
					</thead>
					<tbody>
						{this.state.rankings.map((item, index) => {
							return (
								<tr key={item.username}>
									<td scope="row">{item.rank}</td>
									<td>{item.username}</td>
									<td>{item.totalScore}</td>
									<td>
										<ReactCountryFlag
											countryCode={item.countryCode}
											svg
											cdnSuffix="svg"
											aria-label={item.country}
											title={item.country}
											cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
										/>
									</td>
									<td>{item.institution}</td>
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
