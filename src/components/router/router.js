import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Contest from "../contest/contest";
import Home from "../home/home";
import ProblemDetails from "../problem_details/problem_details";
import Error404 from "../error404/error404";

const Router = props => (
	<Switch>
		<ProtectedRoute
			isAuthenticated={props.isAuthenticated}
			user_session={props.user_session}
			logout={props.logout}
			exact
			path="/contest"
			component={Contest}
			refresh_token={props.refresh_token}
		/>
		<ProtectedRoute
			isAuthenticated={props.isAuthenticated}
			user_session={props.user_session}
			logout={props.logout}
			exact
			path="/problems/:id/:contest_code"
			component={ProblemDetails}
			refresh_token={props.refresh_token}
			username={props.username}
		/>
		<Route exact path="/" component={Home} />
		<Route path="*" exact component={Error404} />
	</Switch>
);

const ProtectedRoute = ({
	component: Component,
	isAuthenticated: isAuthenticated,
	user_session: user_session,
	logout: logout,
	refresh_token: refresh_token,
	username: username,
	...rest
}) => {
	// console.log(rest);
	return (
		<Route
			{...rest}
			render={props => {
				// console.log(props);
				return isAuthenticated ? (
					<Component
						{...props}
						user_session={user_session}
						logout={logout}
						refresh_token={refresh_token}
						username={username}
					/>
				) : (
					<Redirect
						to={{
							pathname: "/"
						}}
					/>
				);
			}}
		/>
	);
};
export default Router;
